# SuperEasyOTP engineering specification

## 1. Chosen architecture
TypeScript monorepo, pnpm workspaces. Extension: React + Vite, Manifest V3, minimum Chrome 127. Website: React + Vite with prerendered/static legal routes. Backend: Node.js active LTS + Fastify + ws. PostgreSQL stores users, accounts, device sessions and watch state. Redis provides short-lived tickets, per-user event fanout and locks. Use maintained compatible package versions and lockfile; verify actual API versions during implementation.

Backend deployment target: Google Cloud Run with HTTP webhook and WebSocket service, Cloud SQL Postgres, managed Redis, Secret Manager/KMS, Cloud Scheduler and Pub/Sub. Account for Cloud Run connection timeouts, reconnects, instance routing and Redis fanout. A single-instance Docker Compose deployment with TLS proxy is acceptable for private testing; production multi-instance correctness is required before scale. Do not use in-memory maps as the only production source of session ownership or event delivery.

Data path:
Gmail -> Pub/Sub -> authenticated webhook -> account event channel -> extension service worker -> Gmail history/messages APIs -> local parser -> extension popup.

Authentication changes the earlier “token-free backend” concept: backend stores encrypted Google refresh tokens to support multiple independently selected accounts and server-driven watch renewal. It returns short-lived access tokens ONLY to that account owner's authenticated extension. Normal backend functions call Google token endpoints and Gmail watch/stop, not message-body APIs. Nonetheless the backend has technical capability to read mail. Restricted-scope review and security assessment are expected; local parsing does not establish an exemption.

## 2. Repository contract
apps/extension: manifest, service worker, popup, welcome/options, assets.
apps/api: OAuth broker, session auth, Pub/Sub webhook, WebSocket fanout, renew/delete jobs.
apps/web: home, privacy, terms, deletion, support, security.
packages/shared: versioned DTOs and Zod schemas, no secrets.
packages/detector: pure MIME/text/link detection logic, fixtures.
infra: Docker Compose, Cloud Run deployment templates, IAM and scheduler scripts.
docs: setup, deployment, data flow, security, store submission, test evidence.

## 3. OAuth and ownership
Do not use the Chrome profile's default Google token as a substitute for independent mailbox identities. Use a Google Web Application OAuth client and backend authorization-code exchange; launch the contextual flow with chrome.identity.launchWebAuthFlow. The registered Google callback is the exact backend HTTPS /oauth/google/callback URL. After exchange, backend redirects to the allowlisted chrome.identity.getRedirectURL destination carrying only an expiring one-time completion code. Never put Google tokens, emails or app bearer tokens in redirect URLs.

Scopes: openid, email and https://www.googleapis.com/auth/gmail.readonly. Request offline access; use select_account for adding an account. Request renewed consent only when required to obtain missing/revoked refresh access. Validate state, nonce, token issuer/audience/signature and granted scopes. Use PKCE where supported plus a separate browser-generated verifier binding the extension to the one-time completion code. Keep OAuth client secret backend-only. Do not overwrite a stored refresh token when Google returns no new refresh token.

First connection creates a user and installation session. Adding subsequent mailboxes must start from an authenticated existing session and bind authorization to its owner; callback URL parameters never decide ownership. Google subject ID is the stable account key. Never merge users because someone supplies an email address or because two device sessions mention the same account. Existing mailbox already owned elsewhere returns a non-disclosing ownership error; add a documented sign-in-to-existing-account path after Google proves ownership. Reinstall can authenticate via a previously linked Google subject. Never silently transfer linked accounts.

App sessions: rotating opaque refresh credentials stored in trusted extension-local storage (not Chrome Sync); hash server-side. Short-lived access tokens in chrome.storage.session restricted to trusted extension contexts. Rotation/replay detection, revocation and expiration mandatory. Google access tokens session-only and per-account, never passed to website or content scripts. Local encryption using a key stored beside ciphertext is not an adequate security claim.

## 4. HTTP and event contracts
All app routes require authenticated session except health, OAuth callback and independently authenticated Pub/Sub/scheduler endpoints. Validate schemas and ownership on every account identifier.
- POST /v1/oauth/start {mode:connect|add, challenge} -> {authorizationUrl}; authenticated for add.
- GET /oauth/google/callback -> exact allowlisted extension completion redirect.
- POST /v1/oauth/complete {completionCode, verifier} -> app session + connected account DTO; single-use, 60s expiry.
- POST /v1/session/refresh -> rotated credentials.
- GET /v1/accounts -> [{id,email,status,watchExpiresAt}].
- POST /v1/accounts/:id/access-token -> {accessToken,expiresAt}; owner only, rate limited, Cache-Control:no-store.
- POST /v1/realtime/ticket -> {ticket}; single use, 30s expiry.
- WebSocket /v1/events: authenticate by first frame within 5s; do not send secrets in URL; no subscribe-by-email interface. Server derives authorized accounts from session. Messages {v:1,type:'mailbox.changed',accountId,historyId,eventId}. Tickets and payloads must not be logged.
- DELETE /v1/accounts/:id -> idempotent disconnect job/status.
- DELETE /v1/user -> confirmed full deletion job/status; session invalidated after job accepted.
- POST /internal/pubsub/gmail -> validated Google OIDC authenticated push.
- POST /internal/jobs/renew-watches -> verified scheduler service identity.
- GET /healthz, /readyz -> no configuration/secret exposure.

Verify Pub/Sub token signature, issuer, intended audience and allowed service-account identity. Validate topic/subscription config and bounded payload. Decode emailAddress/historyId, map using server-held verified mailbox identity. Do not trust client-provided routing emails. Use distinct event IDs for transport deduplication. Acknowledge only once accepted to durable queue/outbox; worker failure retries. Backend event records are transient, not a mailbox archive.

## 5. Storage model and retention
users(id,createdAt,deletedAt); accounts(id,userId,googleSub,email,status,encryptedRefreshToken,keyVersion,watchExpiresAt); devices(id,userId,hashedRefreshCredential,expiresAt,revokedAt); oauthTransactions(stateHash,nonce,challenge,ownerId,returnOrigin,expiresAt,consumedAt); eventOutbox(id,accountId,historyId,createdAt,expiresAt); deletionJobs(id,userId,status,requestedAt).

Constraints: unique Google subject per ownership policy; composite account ownership indexes; history IDs stored as strings, never JavaScript Number; timestamps UTC. Encrypt refresh tokens using managed envelope encryption and documented key rotation. Row-level access in application plus DB role separation. Do not persist subjects, snippets, bodies, OTPs or sign-in URLs on backend.

Targets to implement: completion codes 60 seconds; websocket tickets 30 seconds; OAuth transactions 10 minutes; event outbox <=24h; message content cache session-only capped to 20 recent messages per account with 15-minute TTL; expired OTP candidates cleared after 10 minutes unless sender expiry is earlier (this is display retention, not guaranteed code validity). Store only bounded dedupe IDs/history cursor locally, purge IDs after 24h. Operational logs 14 days without mailbox content/tokens/URLs; backups 30 days maximum. Account disconnect removes active records/secrets immediately after best-effort stop/revoke; unresolved provider cleanup must not retain live credentials indefinitely. Document failure status and retry policy. Backup expiry and deletion behavior must match public policy.

## 6. Gmail synchronization
Initial sync: get current profile/history baseline H0, list latest INBOX message IDs, fetch full messages locally, then history.list from H0 to close the race. Persist cursor only after all pages processed. Avoid notifications for initial/catch-up baseline messages. Support history cursor 404 with bounded recent resync; never permanently fail or download whole mailbox.

On event: serialize sync per account, coalesce triggers, call history.list using last successfully processed cursor, process all pages, select message additions and label changes, and fetch unseen relevant messages. An event's historyId is a wake-up hint, not permission to skip directly to that ID. Deduplicate by (accountId,messageId). Use history response checkpoint after successful processing, not lexicographic sorting. Label changes update list; new INBOX labels on old mail do not automatically imply a fresh OTP.

Watch creation/renewal is backend-owned. For latest-inbox behavior watch INBOX; archived mail isn't an arrival alert in v1, document that. Renew daily before returned expiration, with retry/backoff, monitoring and reconnect on invalid_grant. Watch notifications contain no message body. Backend must not silently fetch bodies as a “fallback.”

Extension live channel: service-worker WebSocket, authenticated heartbeat traffic appropriate to MV3 lifecycle, reconnect exponential backoff with jitter capped at 30s, immediate reconnect on user open/network recovery. Assume workers and sockets can die at any time. Register handlers at top level and persist nonsecret checkpoints. Use chrome.alarms for safety/reconnect checks, not persistent setInterval as the sole scheduler. Reconcile on startup, reconnect and popup open; bounded low-frequency fallback is for gaps only. Handle Google 401 by one refresh/retry; 403 admin restrictions as actionable state; 429/5xx with Retry-After/backoff. No silent error loops.

## 7. Email parser and detector
Parse recursive Gmail MIME payloads, base64url decode with declared character set support/fallback; prefer text/plain, parse HTML as inert data when needed. Never assign raw HTML to live UI; no external image loads. Bound body bytes and recursion; ignore attachments unless a body text part requires its Gmail attachment endpoint. Extract anchors from original HTML without fetching URLs.

Pure detector input: accountId, messageId, internalDate, sender headers, subject, normalized text, anchor text/URLs. Output kind:none|otp|link|both, confidence:low|medium|high, exact code candidates, exact original URL, displayed hostname, reasons, explicit expiry if present.

Codes: candidate patterns for numeric 4–8 digits and contextual alphanumeric/hyphenated codes; preserve leading zeros and case. Strong weight for “verification code”, “one-time code”, “sign-in code” and nearby auth wording. Penalize prices, dates, phones, order IDs, invoice IDs, postal codes and quoted older threads. Multiple equally plausible candidates -> medium confidence, no auto alert. Exclude payment approval, bank transfer authorization and password-reset messages from automatic sign-in alerts in v1; retain visible email and explain “Open email to review” when appropriate. Do not treat sender display name alone as identity proof.

Links: require sign-in/authentication context in anchor text and surrounding body. Exclude unsubscribe, privacy, social, generic homepage, tracking pixels and password-reset actions. Permit HTTPS only by default; reject javascript/data/file, userinfo URL components, malformed/oversized URLs. Preserve signed URL exactly; never prefetch/unfurl/test it because that can consume a one-time link. Show hostname; external identity/redirect domains can be legitimate, but ambiguity lowers confidence. Do not promise that classification proves a link safe. Do not automatically navigate or submit a form.

Fixtures: numeric, leading-zero, alphanumeric, link-only, both, multiple candidates, quoted thread, receipt, bank authorization, password reset, malformed MIME, HTML entities, signed query, Unicode/lookalike host, duplicate message, old timestamp. Synthetic data only in fixtures.

## 8. Browser surfaces and permissions
Use action.default_popup with chrome.action.openPopup for arrival mode. Verify actual focus and dismissal behavior early on minimum supported and current Chrome; never fake a successful popup in tests. Pinning requires user action; feature is not a persistent OS toast. Catch runtime failures and update badge without exposing secret text.

Initial manifest permissions: identity, storage, alarms, clipboardWrite. Host permissions limited to Gmail API origin and configured API HTTPS/WSS origin as required. No <all_urls>, cookies, webRequest, debugger, browsing-history or content-script access in v1. Window focus checks should use minimum available APIs without requesting unrelated permissions. No remote executable code, inline eval or remotely loaded JS; bundle dependencies. Strict CSP; email data remains in extension-owned UI. Do not configure web_accessible_resources exposing private views.

## 9. Security and operations
Verify ownership before minting access tokens and sending events. Origin allowlists supplement authentication, never replace it. Prevent OAuth open redirects, CSRF, replay and session fixation. Rate-limit auth, refresh and event routes. Redact Google errors before logging. No mailbox payload in error-reporting tools. Restrict Google service-account IAM to specific topics, scheduler invocation and needed secrets. Keep OAuth client secret separate from app code. Do not log Authorization or WebSocket auth frames. Model Google tokens and extracted codes as account-access secrets.

Disconnection: stop watch and revoke grant best effort, invalidate sessions for removed account access, delete refresh token/mapping/events, broadcast removal to active devices, clear local account data. Warn accurately if Google's revocation affects other connections under the same grant; verify behavior with test accounts. Full user deletion removes all linked mailboxes and sessions; no email is deleted from Gmail. Uninstallation cannot reliably trigger authenticated backend cleanup; explain website/support deletion and Google revocation paths.

## 10. Testing and handoff
Unit parser/score/TTL/merge tests; API integration tests for ownership, OAuth replay, webhook forgery, refresh rotation, deletion, outbox idempotency; browser extension tests for manual/automatic views, clipboard, toggle, three accounts, sleeping/restarted service worker. Native popup behavior requires manual real-Chrome evidence in addition to automation. Measure live Gmail timeline across at least ten sign-in deliveries from several services; report median/p95 and misses without logging codes or content. This is a preliminary sample, not a performance guarantee.

Ship commands for install/dev/build/test/typecheck/lint/extension:zip. Supply .env.example with no real credentials, Docker Compose, migrations, deployment scripts, rollback guidance and a setup checklist. No deployment performed without operator credentials and explicit release instruction. External Google configuration must be documented as remaining work if unavailable. Synthetic demo uses a separate dev flag and is visibly labeled; production must reject demo flags.
