# InstaMail — complete Cursor build context

Paste the contents into Cursor Agent or attach this file and ask it to execute the Cursor prompt below. Read all sections before implementation.

# Paste this entire prompt into Cursor Agent

Build InstaMail completely from the specification documents in this folder. This is an implementation request: create working application code, backend, static website, deployment assets, tests and release artifacts. Work through the whole scope; do not stop after scaffolding or a plan.

Read 00-START-HERE.md, 01-PRD.md, 03-TECHNICAL-SPEC.md, 04-WEBSITE-COPY.md, 05-PRIVACY-POLICY.md, 06-TERMS.md, 07-DATA-DELETION.md and 08-LAUNCH-AND-VERIFICATION.md before coding. Treat the PRD as product authority, technical spec as engineering authority, and legal copy as drafts that must match actual behavior. Record and resolve inconsistencies; never silently change privacy architecture or reduce UX to timed inbox polling.

InstaMail supports multiple Gmail/Workspace accounts in a single Chrome profile. Clicking the extension shows latest 5 emails by default; users choose 1/3/5. Each row surfaces high-confidence OTPs and sign-in links with copy/open actions. New OTP/sign-in mail automatically opens a compact native Chrome toolbar popup when enabled, including when the extension UI was closed. Turning it off preserves email reading and inline detection. Build this exact product.

Use the stack and repo layout from the technical spec. Verify current primary documentation before using version-sensitive APIs. Read repository instructions before changing files. Create an isolated instamail application directory if working in an unrelated existing repository. Never overwrite unrelated work.

Execution order:
1. Write a short implementation checklist and requirement-to-file map. Establish monorepo, package scripts and shared schemas.
2. Build the critical technical spike first: independently selected Google OAuth accounts, Gmail watch/PubSub event relay, extension reconnection, local message fetch and chrome.action.openPopup. Prove the API surface; do not spend the whole effort polishing mock UI before discovering a broken auth or popup assumption.
3. Implement detector with synthetic fixtures and unit tests. No cloud LLM calls. No raw email HTML rendering.
4. Implement all extension states, inbox merge/limit settings, inline actions, automatic popup intent/queue/toggle, preview, accessible settings and account lifecycle.
5. Complete backend ownership enforcement, encrypted credential storage, scheduler renewal, Pub/Sub verification, durable outbox, WebSocket authentication, deletion and reconnect cases.
6. Build website routes and exact editorial content, adapting copy only to keep claims truthful. Legal pages must be accessible via direct URL and browser refresh. Fill operator-provided values only; keep missing details clearly marked in development. Add a production placeholder check.
7. Run meaningful unit, integration and browser checks. Test hostile email fixtures, tenant boundaries and token leakage. Exercise popup keyboard/focus behavior in real Chrome. If Google credentials are unavailable, ship fully runnable synthetic fixtures and exact setup instructions, but label live integration UNVERIFIED.
8. Build extension ZIP and website/backend production outputs. Run manifest/CSP/dependency/build checks. Produce docs/IMPLEMENTATION-REPORT.md mapping every acceptance criterion to evidence, partial status or blocker. Record files, commands, actual results and external launch gates. Do not report tests as passed if they were not run.

Required external configuration: Google Cloud project, OAuth client/secret and callback domain, fixed Chrome extension ID, authorized extension return URL, Gmail API, Pub/Sub topic/subscription and Gmail publisher IAM, authenticated push identity/audience, scheduler identity, PostgreSQL/Redis, encryption key/KMS, public website/API domain. Create scripts/templates and .env.example. Never fabricate secrets, store them in git, or bypass Google warnings/verification. Ask concise questions only for truly blocking values; continue independent implementation while waiting.

Important details:
- Backend stores encrypted per-mailbox refresh tokens for multi-account access and renewal; email contents are normally fetched and parsed in extension. Public wording must disclose server capability correctly. Do not promise “we cannot access mail”.
- All ownership derives from authenticated sessions and Google-verified subject IDs, not email query strings.
- One-time auth completion codes must be bound to the initiating extension's verifier; auth/refresh tokens never go in URLs or logs.
- Auto-popup is Chrome's native action popup, not a secret-bearing overlay in arbitrary website DOM. Chrome owns geometry and focus. Do not request all-site permissions to simulate the design.
- Persist Gmail history cursors only after processing all pages; recovered historical mail must not flood alerts.
- HTTPS signed sign-in URLs must not be prefetched or modified. Copy exactly; preserve leading zeros.
- Missing Google credentials do not justify replacing live production behavior with fake success or fake inbox data.
- No advertisements, billing, analytics SDKs, mailbox data sales, general AI training, or full inbox mirroring in v1.
- No guarantee of public store/OAuth approval. Development completion and public launch approval are separate report items.

Keep working until all code and documentation possible with available credentials is complete. Final handoff must include setup commands, launch gates, test evidence, artifact paths and honest outstanding requirements.


---

# Source document: 00-START-HERE.md

# InstaMail — build package
Prepared 10 November 2026. Product owner decisions: multiple Gmail / Google Workspace inboxes; legal identity, domain and contacts use placeholders.

## How to use
Copy this entire folder into a new repository. Open `02-CURSOR-PROMPT.md` in Cursor Agent and paste its full contents as the first instruction. Keep every other document available as context. The agent is instructed to implement and test the product, not merely generate a scaffold.

Read order:
1. `01-PRD.md` — product behavior, UX and acceptance criteria.
2. `03-TECHNICAL-SPEC.md` — architecture, contracts, security and deployment.
3. `04-WEBSITE-COPY.md` — complete website content and layout requirements.
4. `05-PRIVACY-POLICY.md`, `06-TERMS.md`, `07-DATA-DELETION.md` — publishable drafts once placeholders are completed and implementation matches.
5. `08-LAUNCH-AND-VERIFICATION.md` — disclosures, listing copy, Google submission and external setup.

## Definition of delivery
A working Chrome extension, service backend, website, migrations, deployment configuration, documented Google setup, automated checks, and release ZIP. A synthetic demo can run without Google credentials, but must be visibly identified as demo data. Live integration must never be presented as complete until real Gmail authorization and push have been tested.

## Scope and constraints
The weekend target is a complete implementation tested with approved test users. Public Gmail OAuth verification and Chrome Web Store review are external processes and are not guaranteed to finish over a weekend. Documents do not guarantee either approval. This is a build specification and legal draft package, not a legal opinion.

Launch is free, without advertising or paid plans. Ads were considered in ideation but are deliberately deferred from this first release; any future introduction requires a separate product decision and updated disclosures. No third-party analytics or hosted AI receives mailbox data.

## Decisions made for implementation
- Gmail only, multiple accounts in one Chrome profile; provider abstraction allows future Outlook support.
- Five latest inbox emails by default, settings allow exactly 1, 3 or 5.
- All-inboxes view is default; limit is total across the selected view, not per account.
- Automatic OTP/sign-in popup is on by default, disclosed during onboarding and immediately switchable off.
- Email bodies are fetched and parsed in the extension. Backend stores encrypted Google refresh tokens and mailbox event metadata, and renews watches.
- Backend credentials confer Gmail access: do not claim the service cannot access email or that all data stays on-device. Budget for restricted-scope verification and annual security assessment.
- Installation opens a welcome page with a clear Connect Gmail action before Google's consent screen. This gives context and an explicit authorization gesture.
- A genuine Chrome action popup supplies the below-icon presentation. Chrome controls placement, dismissal and focus; exact placement cannot be guaranteed if the icon is unpinned or browser UI differs.

## Placeholder register — replace before production
`[LEGAL_OPERATOR_NAME]`, `[BUSINESS_OR_CONTACT_ADDRESS]`, `[SUPPORT_EMAIL]`, `[PRIVACY_EMAIL]`, `[SECURITY_EMAIL]`, `[PUBLIC_DOMAIN]`, `[API_DOMAIN]`, `[CHROME_STORE_URL]`, `[EFFECTIVE_DATE]`, `[GOVERNING_JURISDICTION]`, `[HOSTING_REGION]`, `[INFRASTRUCTURE_PROVIDERS]`.
Deployment must fail its production content check if required placeholders remain. Domain availability and trademark clearance for InstaMail have not been checked.


---

# Source document: 01-PRD.md

# InstaMail product requirements

## 1. Product and outcome
InstaMail is a lightweight Chrome email companion for multiple Gmail accounts. Users glance at recent emails and retrieve authentication codes or sign-in links without switching to Gmail. It supports both deliberate inbox checking and automatic arrival alerts.

Primary job: “I just requested a login email. Show the actionable code or link as soon as it arrives, with one-click copy.” Secondary job: “Show my latest emails without opening a full email app.”

Success means fast, correct, trustworthy delivery. Google and sender email transit are outside our control. Never market guaranteed instant or universally correct detection.

## 2. Release scope
P0: install onboarding, Google OAuth, multiple Gmail accounts, unified/per-account inbox, 1/3/5 visible emails, inline OTP/link actions, auto-arrival popup toggle, reconnect and renewal, safe previews, account removal and data deletion, accessible website/legal pages, store/verification materials.
P1 after launch: site-specific autofill, Outlook, sending/replying, search, bulk actions, paid tiers, advertisements, mobile, multilingual detector expansion.
No hosted LLM dependency in P0. Detection runs deterministically in the extension; do not call the product “AI-powered” without an actual reviewed implementation.

## 3. Personas
- A user with personal and work Gmail accounts who signs into web services repeatedly.
- A user who wants a compact email reader and turns automatic popups off.
- A user with multiple concurrent login attempts who needs the correct recipient and service clearly identified.

## 4. Installation and onboarding
1. First installation opens the packaged welcome page once. Updates never reopen it.
2. Explain: “Your recent emails and sign-in codes, one click away.” Show a short access disclosure and Connect Gmail.
3. User clicks Connect Gmail; Google account chooser and consent flow appear. Explain read-only access before consent; link Privacy and Terms. Do not request a Gmail password.
4. On success, show connected address, load newest inbox messages, and register push watch.
5. Offer Add another Gmail account and a concise instruction to pin InstaMail. Pinning is user-controlled, not automatic.
6. Show “Automatically show sign-in codes” enabled and directly editable. Finish opens inbox.

Do not mark connection successful until token scope, account identity and initial Gmail request succeed. Denial returns to welcome with Try again; cancellation is neutral. Workspace admin denial explains that an administrator may need to allow the app. Do not suggest bypassing admin restrictions. Reconnecting one account must leave the others usable.

## 5. Toolbar inbox
Width target 380px; adapt between 340 and 420px. Respect Chrome's popup size limit and viewport; scroll the list when needed. Header contains logo/name, account selector and Settings. Default selector is All inboxes; list includes each address, state and Add account. Remember the selection locally.

Show the newest N inbox messages ordered by Gmail internalDate descending; deterministic tie-break by account ID and message ID. N defaults to 5 and permits 3 or 1. In All inboxes, N is the combined total. Exclude Spam and Trash. Include read and unread email. Read-only access means opening a preview does not mark a message as read in Gmail.

Each row displays sender, subject, relative time, one-line plain-text snippet and unread indication. Unified view also shows recipient account. Long text truncates visually while remaining available to assistive technology. Empty subject becomes “(No subject)”. Entire row opens a compact plain-text preview; distinct controls do not also activate row navigation. Preview includes From, To, subject, time and Open in Gmail. Never load tracking images or execute email HTML.

A high-confidence code appears in a monospace chip preserving leading zeros and letter case, with Copy code. Success feedback is “Copied” for 1.5 seconds, announced accessibly; clipboard failure gives retry and selectable text. A high-confidence sign-in link appears as Open sign-in link, with its destination hostname visible. If both exist, show both. Medium-confidence candidates require opening the message; do not manufacture a primary action.

Show cached session data immediately, then refresh. A per-account error must not blank other accounts. Provide concise states: Connecting, Checking mail, Offline—showing recent emails, Reconnect [address], No emails yet, Couldn't refresh—Try again. Avoid generic indefinite spinners.

## 6. Automatic arrival popup
Trigger only for a newly added incoming message with a high-confidence OTP or sign-in link, for a connected account, while automatic popups are enabled and Chrome is active.

Use the native extension action popup, opened through chrome.action.openPopup. It is anchored to Chrome's extension UI, normally below the pinned icon. It is not an arbitrary desktop toast: Chrome controls positioning, focus and dismissal. Do not substitute a website overlay that exposes secret text to arbitrary page DOM. Do not claim pixel-perfect positioning everywhere.

Compact alert layout: account, sender/service, “Sign-in code”, large code, Copy code, optional Open sign-in link, sender timestamp, dismiss control, View inbox. A link-only alert uses “Sign-in link ready”. Show no ad or unrelated promotion in this surface.

Opening manually shows the full inbox. Automatic opening shows alert mode. Use a short-lived alert intent ID in session storage to distinguish modes; consume and clear it on mount. Closing and manually reopening must show inbox, not a stale alert.

If inbox is already open, insert/update the row and show a small in-popup arrival notice; do not open another popup or reset keyboard focus/scroll. Multiple simultaneous alerts form a bounded queue with next/previous and account labels. Never replace an in-progress copy interaction.

Suppress alerts for initial sync, account connection, historical catch-up after long absence, already handled message IDs, deleted/Spam/Trash messages, ambiguous codes and stale messages. A short reconnect can alert for unseen messages within two minutes; older ones appear in the inbox only. Recent code age must not be described as a guaranteed validity period. If email explicitly states expiry, display it as sender-provided information.

Only auto-open in a focused, non-incognito Chrome window. Never activate or focus a background browser window. If Chrome rejects opening, keep the item accessible, show a neutral badge, and retry only on a fresh appropriate event. Do not repeatedly steal focus. Do not put OTP text in OS notifications, toolbar badge, logs or analytics. No browser-closed delivery promise.

Setting off suppresses every automatic popup; email fetching, detection and inline actions continue. A privacy/quiet toggle should take effect immediately, including queued alerts. Global toggle plus optional per-account override; global off always wins.

## 7. Settings and account management
- Recent emails: segmented control 1 / 3 / 5; default 5; immediate update.
- Automatic sign-in popups: on/off; default on with onboarding disclosure.
- Theme: system/light/dark; default system.
- Accounts: address, connection state, reconnect, remove, add account. No arbitrary paid account cap; validate with at least three independent Google accounts.
- Privacy: Disconnect all and delete InstaMail data, privacy policy, support.
- About: version, terms, store link once published.
Settings persist locally without Chrome Sync. Removing an account clears its session cache and future events. Removing the last account returns to welcome. Full deletion requires a clear confirmation and must be retryable if offline.

## 8. Experience and visual design
Quiet, compact, polished utility. Warm white/light neutral background, restrained blue accent, charcoal text, subtle row separators, 12px panel radii, 8px spacing grid, 14px body and 12px metadata. Dark theme must be designed rather than color-inverted. Prefer locally bundled/system fonts and SVG icons. No decorative gradients that impair reading.
All controls have accessible names, visible keyboard focus, adequate contrast and practical hit areas; follow WCAG 2.2 AA. Tab order is predictable, Escape dismisses preview/dialogs, Enter activates selected actions, status feedback uses aria-live. Support reduced motion. Never animate code digits individually. Screen-reader labels identify the account and action without announcing secrets unsolicited.

## 9. Performance targets and truthfulness
Engineering targets, not verified claims: cached popup visible within 150ms on reference hardware; extraction below 50ms for normal emails; UI update within 100ms after detection; p95 Gmail-available-to-alert below 5 seconds during healthy connected sessions. Record real distributions before adopting these targets as claims. Pub/Sub may exceed them. Measure sender-to-Gmail latency separately.

Primary delivery is push. Reconciliation on reconnect, popup open and periodic safety checks prevents permanent gaps; it must not replace push with a 30–60 second primary polling loop.

## 10. Acceptance matrix
| Scenario | Required outcome |
|---|---|
| Fresh install | Welcome once, contextual Connect Gmail, cancellation recoverable |
| Three Google accounts | Independent identity/tokens, correct recipient labels, no cross-account events |
| Limit changes | Exactly newest 1/3/5 overall or selected account, no off-by-one |
| OTP 004291 | Leading zeros preserved; copy returns exact value |
| Code and link | Both row actions; correct hostname and recipient |
| Link-only email | Link action without invented OTP |
| Receipt with phone/order number | No high-confidence OTP alert |
| New OTP, popup closed | Native popup opens promptly in focused Chrome |
| Popups off | No auto-open; row still contains detected action |
| Popup already open | Row updates without focus reset |
| Duplicate/out-of-order events | One alert, no skipped changes |
| Browser asleep/offline | Catch-up on return, no old-alert flood |
| One revoked account | Reconnect state only for that account |
| Unauthorized WebSocket join | No event data and no Gmail token returned |
| Removal/deletion | Watch stopped when possible, secrets/data erased, no future delivery |
| Malicious email HTML/link | No script/images loaded; unsafe URLs rejected |
| Production build | No demo fallback, credentials or legal placeholders |

## 11. Launch gates
Real Gmail OAuth and push validation; native popup behavior validated in current supported Chrome; detector fixture suite; tenant isolation tests; privacy implementation audit; completed legal placeholders; Google OAuth verification/security assessment as required; Chrome Store submission. No document or generated code substitutes for these gates.


---

# Source document: 03-TECHNICAL-SPEC.md

# InstaMail engineering specification

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


---

# Source document: 04-WEBSITE-COPY.md

# InstaMail website draft and implementation brief
Status: ready for implementation; replace placeholders and validate every claim against shipped behavior before publishing. This is the complete copy specification, not a deployed website.

## Design and routes
A fast, simple static website. Responsive 1120px max content width; generous whitespace, matching extension colors, system/local fonts, clear focus states and light/dark support. Avoid tracking pixels, third-party embeds, autoplay and analytics SDKs. Use realistic synthetic inbox UI screenshots, explicitly marked illustrative until real release screenshots exist. No fake reviews, user counts, guarantees, security badges or “Google approved” language.
Routes: /, /privacy, /terms, /delete-data, /support, /security. All legal pages are public and directly reachable without sign-in. Footer on every page links to all routes and names the operator. Same owned domain for homepage/privacy. Render main content statically for reviewers and accessibility.

## Homepage
Page title: InstaMail — Your inbox, a click away
Meta description: Check recent emails across your Gmail accounts. Copy sign-in codes and open login links directly from a compact Chrome extension.

Navigation: InstaMail | How it works | Privacy | Support | Add to Chrome
The installation button must use the real store listing after approval. Before approval, label it “Coming to Chrome” and link to a short availability explanation; never simulate a completed install. Do not collect waitlist addresses without implementing a separate consent/retention policy.

Hero eyebrow: A little less switching. A little more flow.
Hero headline: Your inbox. Your sign-in code. Right here.
Hero body: Check your latest emails, copy a verification code, or open a sign-in link—all from your Chrome toolbar. Connect your personal and work Gmail accounts and keep moving.
Primary CTA: Add to Chrome
Secondary CTA: See how it works (anchor)
Supporting line: Free to use. Built for Chrome and Gmail.

Hero illustration: Native toolbar icon above a compact InstaMail panel. Synthetic row: “Example App · Your sign-in code · just now”, code “004291”, Copy code. Second row: a routine email. Label: Illustrative preview. Never use a real login link.

Feature section heading: The useful part of your inbox, without the detour.
Feature 1 title: Your latest emails, at a glance.
Body: See your newest five emails in a condensed view. Prefer an even smaller inbox? Choose three or one in Settings.
Feature 2 title: Codes and links, ready to use.
Body: When InstaMail recognizes a sign-in code or link, it places the action beside the email. Copy the code or open the link with a click.
Feature 3 title: Your accounts, together.
Body: Connect multiple Gmail accounts. View them together or switch to one inbox, with the recipient account clearly shown.
Feature 4 title: A popup when you want it.
Body: Enable automatic sign-in popups to see new codes as they arrive while Chrome is active. Turn them off whenever you prefer to check mail yourself.

How it works heading: Connect once. Keep your flow.
Step 1: Add InstaMail to Chrome.
Text: Open the welcome screen and choose Connect Gmail.
Step 2: Choose your Google account.
Text: Review the access request and connect an account. Add another whenever you need it.
Step 3: Check mail—or let the code come to you.
Text: Click the icon for recent emails. With automatic popups enabled, recognized sign-in messages can appear in a compact toolbar popup.

Privacy section heading: Know what you’re connecting.
Body: InstaMail requests read-only Gmail access to find recent emails and sign-in messages. Message contents are normally fetched and processed inside the extension. Our backend manages encrypted account credentials and mailbox-change notifications to keep accounts connected. It does not maintain an archive of your email bodies or codes.
Second paragraph: Because these credentials authorize Gmail access, the service has the technical ability to access your connected mailbox. We restrict that access to providing InstaMail. Gmail data is not sold, used for advertising, or used to train general AI models.
Link: Read our privacy policy.

FAQ:
Q: Which email accounts can I connect?
A: Gmail and Google Workspace accounts. Your Workspace administrator may need to approve access. Other email providers are not supported in this release.
Q: Can I use more than one account?
A: Yes. Add each Gmail account separately and switch between them or use All inboxes.
Q: Will codes appear instantly?
A: InstaMail uses Gmail change notifications to surface recognized sign-in messages promptly. Timing depends on the sender, Gmail, your connection and Chrome. Delivery and detection are not guaranteed to be instant.
Q: Can I turn off the popups?
A: Yes. Turn off automatic sign-in popups in Settings. Your recent emails and inline code/link actions remain available.
Q: Does it work when Chrome is closed?
A: The extension displays updates while Chrome is running. When you return, it reconnects and refreshes your inbox.
Q: Does InstaMail change my emails?
A: No. This release reads email; it does not send, delete or mark messages as read in Gmail.
Q: Why does Google ask for access to my Gmail?
A: Gmail does not offer permission limited only to OTP emails. Read-only message access is needed to recognize codes in the email body. You can disconnect at any time.
Q: How do I disconnect and delete data?
A: Open Settings to remove an account or choose Disconnect all and delete data. You can also contact us. Uninstalling the extension alone does not delete your server account. See the deletion guide.
Q: Is InstaMail made by Google?
A: No. InstaMail is an independent product operated by [LEGAL_OPERATOR_NAME].

Final CTA heading: Keep the code close.
Body: A small inbox for the moments you need it.
Button: Add to Chrome (same real-listing rule).
Footer: © [CURRENT_YEAR] [LEGAL_OPERATOR_NAME]. InstaMail is not affiliated with or endorsed by Google. Gmail, Google Workspace and Chrome are trademarks of Google LLC.

## /support
Title: How can we help?
Intro: For connection problems, missing codes or feedback, contact [SUPPORT_EMAIL].
Troubleshooting:
- Can't connect? Check that you selected the correct Google account and granted Gmail access. A managed account may require administrator approval.
- No popup? Check Settings → Automatic sign-in popups, pin the icon, and make sure Chrome is active. Ambiguous or older messages may appear in the inbox without an alert.
- Missing email? Refresh and check the account selector. InstaMail shows recent inbox mail, not Spam, Trash or archived messages.
- Connection expired? Choose Reconnect next to that account.
- Clipboard didn't work? Retry Copy code or select and copy the code manually.
Support request note: Tell us your extension version, Chrome version and a description. Never send passwords, live OTPs, sign-in links or full email contents. Redact sensitive information from screenshots.
Links: Privacy, Delete your data, Report a security issue.

## /security
Title: Security at InstaMail
Body: InstaMail handles account-access information. We use encrypted transport, restricted infrastructure access and encrypted storage for retained Google credentials. Message contents are normally processed inside the extension rather than archived on our servers. Our backend receives mailbox-change metadata and manages account access and notification watches.
Body: No system can guarantee perfect security. Do not treat a recognized email or link as proof of its sender's legitimacy. Check the sender and destination before acting.
Reporting: Report suspected vulnerabilities privately to [SECURITY_EMAIL]. Include reproducible steps using synthetic or your own test data. Do not access other people's data. We will acknowledge reports when practicable; no response-time or bounty promise is made.
Review status: Show only factual, evidenced status. Do not display certification badges, “CASA certified”, “Google approved” or audit claims until appropriate review is completed and wording is authorized.

## Legal routes
/privacy renders 05-PRIVACY-POLICY.md without internal editorial notes.
/terms renders 06-TERMS.md without internal editorial notes.
/delete-data renders 07-DATA-DELETION.md without internal editorial notes.
Production checks require real operator/contact/domain/effective date/jurisdiction/hosting values. Keep legal pages text-selectable and printable. Do not hide policies inside accordion panels or require cookies to view them.


---

# Source document: 05-PRIVACY-POLICY.md

# InstaMail Privacy Policy
DRAFT — replace placeholders and confirm deployed behavior before publication. Remove this editorial line only after review.
Effective date: [EFFECTIVE_DATE]

## Who we are
InstaMail is operated by [LEGAL_OPERATOR_NAME], at [BUSINESS_OR_CONTACT_ADDRESS] (“we”, “us”). This policy explains how we handle information when you use our Chrome extension, website and supporting services. Contact [PRIVACY_EMAIL] with privacy questions or requests.

## What InstaMail does
InstaMail connects to Gmail accounts you authorize, displays recent inbox emails, and identifies possible verification codes and sign-in links. You can connect multiple accounts and choose whether recognized sign-in messages open an automatic extension popup.

## Information we access and collect
When you connect an account, we receive its Google account identifier, email address, authorized permissions and OAuth credentials. We do not ask for or receive your Google password. Google read-only Gmail authorization permits access to mailbox messages; it is not limited by Google to OTP emails.

The extension accesses recent email headers and contents, including sender, recipient, subject, timestamps, message identifiers, snippets, message text and links, to display your inbox and recognize sign-in information. Extracted verification codes and links are processed in the extension. Email messages may contain sensitive information, so only connect accounts you are authorized to use.

Our backend receives mailbox-change notifications containing your email address and a mailbox history identifier. It stores account connection records, encrypted Google refresh credentials, watch expiration information, and session/security records. These credentials give the service the technical ability to access the connected Gmail account. Our normal design uses the backend to maintain account connections, obtain access tokens and renew notification watches, while the extension fetches and processes message contents. We do not maintain a backend archive of email bodies, verification codes or sign-in links.

We also process basic technical information needed to operate and secure the service, such as request timestamps, error categories, network addresses and authentication events. We configure application logs to exclude email bodies, codes, sign-in URLs and authentication tokens. Infrastructure providers may process network information to deliver and protect the service.

If you contact support, we receive the contact details and information you choose to send. Please do not send passwords, live verification codes, sign-in links or unnecessary email contents.

## How we use information
We use information to connect and maintain authorized Gmail accounts; display recent inbox messages; identify and show sign-in information; deliver mailbox update signals; remember settings; protect accounts and infrastructure; diagnose service problems; respond to requests; and meet applicable legal obligations.

We request only permissions needed for these functions. This release does not send or delete Gmail messages or change their read status. Automatic popups can be turned off without disconnecting your inbox.

## Google user data and Limited Use
InstaMail’s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including its Limited Use requirements, and applicable Google Workspace and Chrome Web Store user-data policies.

We do not sell Google user data, transfer it to data brokers, use it to serve advertising, or use it to create, train or improve general-purpose AI or machine-learning models. We do not send email contents to a hosted AI service for detection in this release. We restrict Google user data to providing or improving the disclosed user-facing features and other uses permitted by the applicable policies.

Humans do not routinely review email contents. Any exceptional human access must meet the applicable Google policy conditions, such as your documented consent to view specified information, security investigation, legal compliance, or permitted aggregated internal operations. Support access is not blanket permission to inspect your mailbox.

## Sharing and service providers
We use [INFRASTRUCTURE_PROVIDERS] to provide hosting, database, messaging, encryption/key management and operational support. Providers process the information necessary to perform those services under applicable contractual restrictions. The current hosting region is [HOSTING_REGION]. We do not embed advertising or third-party behavioral analytics SDKs in the extension or website for this release.

We may disclose information when necessary to comply with applicable law, protect against fraud or security threats, or enforce legitimate rights, subject to the restrictions governing Google user data. If ownership of the product changes, transfers of Google user data will follow applicable policy requirements, including prior explicit consent where required.

## Storage and retention
Settings and nonsecret account identifiers are stored locally in your Chrome profile. Email display data and extracted sign-in information are held in an extension session cache, normally for no more than 15 minutes; code candidates are cleared after no more than 10 minutes or earlier stated expiration. These limits describe our display retention, not whether a code remains valid at its issuer. Session content is not synced using Chrome Sync. Message IDs used to prevent duplicate alerts are retained locally for up to 24 hours.

Backend credentials and account connection records are retained while your accounts are connected. Temporary OAuth transactions expire within 10 minutes; completion codes and connection tickets expire within seconds. Queued mailbox-change events expire within 24 hours. Content-free operational logs are retained for up to 14 days. Backups expire within 30 days, and deleted account credentials must not be restored into active use. Support correspondence is retained only as reasonably necessary to resolve your request and meet applicable obligations; contact us to request deletion.

On disconnect or deletion, we remove associated active records and credentials, stop notification watches and revoke access where possible, and clear related extension data. Provider-side operations may fail temporarily; we report and handle such failures without silently retaining account access indefinitely. Some information may be retained when legally required or necessary for a documented security matter, subject to applicable policy limitations.

## Security
We use encrypted transport and encrypt stored Google refresh credentials, with access controls and restricted infrastructure permissions. No system is completely secure. Codes and sign-in links can grant access to accounts: avoid sharing them and take care when your screen is visible to others.

## Your choices and rights
You can disable automatic popups, change the email display limit, remove individual Gmail accounts, or disconnect all accounts and request deletion in Settings. See [PUBLIC_DOMAIN]/delete-data for instructions and alternatives. You can revoke Google access through your Google Account's third-party connections settings. Revocation stops future authorized Google access but is not itself a deletion request for records already held by InstaMail.

Uninstalling the extension alone does not notify us reliably or delete your backend account. Disconnect before uninstalling, or contact [PRIVACY_EMAIL] afterward.

Depending on where you live, you may have rights to access, correct, delete, restrict or object to processing, receive a copy of your information, withdraw consent, or complain to a relevant data-protection authority. We will respond as required by applicable law and may request proportionate identity verification. Email [PRIVACY_EMAIL]. Where required, we rely on your consent for authorized Gmail access, providing the requested service for related processing, legitimate interests for proportionate security/operations, and legal obligations where applicable. Withdrawal does not make previous lawful processing unlawful.

## International processing
Information may be processed in [HOSTING_REGION] and in locations used by the listed providers. Where applicable law requires safeguards for international transfers, we will use appropriate safeguards and disclose further details on request.

## Children
InstaMail is not directed to children under 13 or any higher minimum age required by applicable local law. We do not knowingly seek their personal information. Contact us if you believe a child has provided information inappropriately.

## Website storage
The public information website does not use behavioral advertising cookies or tracking pixels. Necessary authentication/session mechanisms may be used on service endpoints. If these practices change, we will update the policy and obtain consent where required before introducing the new processing.

## Changes
We will update the effective date when this policy changes. For material changes, we will provide appropriate notice. If we change our use of Google user data beyond what you authorized, we will obtain the consent required by Google's policies and applicable law before using it that way.

## Contact
[LEGAL_OPERATOR_NAME]
[BUSINESS_OR_CONTACT_ADDRESS]
Privacy: [PRIVACY_EMAIL]
Support: [SUPPORT_EMAIL]


---

# Source document: 06-TERMS.md

# InstaMail Terms of Use
DRAFT — complete placeholders and review for the operator's jurisdiction before publication. Remove this editorial line after review.
Effective date: [EFFECTIVE_DATE]

## 1. Agreement and operator
These Terms govern your use of InstaMail, including its Chrome extension, website and supporting services, provided by [LEGAL_OPERATOR_NAME], [BUSINESS_OR_CONTACT_ADDRESS] (“we”, “us”). By accepting these Terms during onboarding and using InstaMail, you agree to them. If you do not agree, do not connect an account or use the service. Contact [SUPPORT_EMAIL] with questions.

## 2. Eligibility and accounts
You must have legal capacity to enter this agreement, meet applicable minimum-age requirements, and be authorized to connect every mailbox you add. If you use InstaMail for an organization, you are responsible for obtaining the organization's required permissions. Workspace administrators may restrict access.

You remain responsible for your Google accounts, devices and access credentials. Do not share live codes, sign-in links or session credentials with others. Notify us promptly of suspected unauthorized use of InstaMail.

## 3. Service and permission
InstaMail provides a compact view of recent Gmail inbox messages and detects possible verification codes and sign-in links. It can show automatic extension popups when enabled. You authorize the access necessary for these features through Google's permission flow. You may revoke access or disconnect as described in the Privacy Policy.

The current release is read-only: it does not send, delete or mark messages as read in Gmail. A display or link action does not mean that the sender, message or destination has been independently verified as safe. A link can perform an account action when you choose to open it.

## 4. Availability and accuracy
InstaMail depends on Google, Chrome, your network and third-party email senders. Notifications can be delayed, missed or unavailable; messages may be misclassified; codes and links can expire. We do not guarantee continuous availability, detection of every code, compatibility with every message format, exact popup positioning, or delivery within a particular time. You should retain access to Gmail for messages that are not displayed or recognized.

We may improve or change features, maintain the service, or discontinue features with reasonable notice where practicable and required. We will not use a change in terms to bypass required consent for a new use of Google user data.

## 5. Acceptable use
Use InstaMail only for lawful access to accounts you own or are authorized to use. Do not attempt to access another person's mailbox, intercept others' authentication information, bypass security controls, exploit the service, disrupt infrastructure, distribute malicious content or use InstaMail to violate another service's terms or applicable law. Do not misrepresent your identity when requesting account access or support.

## 6. Privacy and your content
Our Privacy Policy at [PUBLIC_DOMAIN]/privacy explains how data is accessed, used, shared and retained. You retain your rights in email and other content. You grant only the permissions reasonably necessary to provide the features you request, subject to the Privacy Policy and applicable Google policies. We do not acquire ownership of your emails or grant ourselves a general license to monetize them.

## 7. Intellectual property
We or our licensors own InstaMail's software, branding and website materials, subject to applicable open-source licenses. We grant you a limited, nonexclusive right to use the service under these Terms. This does not restrict rights you have under applicable open-source licenses or mandatory law. Google, Gmail, Google Workspace and Chrome belong to their respective owner. InstaMail is independent and is not endorsed by Google.

## 8. Pricing
The launch version is free. There are no subscription charges under these Terms. If we introduce optional paid features later, pricing and applicable terms will be presented before you agree to purchase. No silent conversion to a paid subscription will occur.

## 9. Suspension and termination
You may stop using the service at any time. Disconnect accounts and request deletion in Settings or follow [PUBLIC_DOMAIN]/delete-data. Uninstalling alone does not delete server-side records.

We may restrict or suspend access where reasonably necessary to address misuse, protect users or comply with law or platform requirements. We will provide notice when practicable and legally permitted. Termination does not cancel applicable data-deletion obligations or mandatory consumer rights.

## 10. Disclaimers
To the extent permitted by applicable law, the service is provided as available and without warranties beyond those expressly stated. This does not exclude any warranty, guarantee or remedy that cannot lawfully be excluded. InstaMail is not a substitute for your email provider, an identity verification service, or an assurance that a sign-in request is legitimate.

## 11. Liability
To the extent permitted by applicable law, we are not responsible for indirect or consequential losses arising from use of the service. Nothing in these Terms excludes or limits liability where doing so is prohibited, including applicable liability for fraud, deliberate misconduct, or mandatory consumer protections.

## 12. Governing law and disputes
These Terms are governed by the laws of [GOVERNING_JURISDICTION], subject to any mandatory consumer protections and jurisdiction rights applicable where you live. Contact [SUPPORT_EMAIL] first so we can attempt to resolve a concern. No mandatory arbitration or class-action waiver is included in this draft.

## 13. Changes and contact
We will publish updated Terms with an effective date and give notice of material changes where required. Changes do not remove rights that cannot lawfully be waived.
[LEGAL_OPERATOR_NAME]
[BUSINESS_OR_CONTACT_ADDRESS]
[SUPPORT_EMAIL]


---

# Source document: 07-DATA-DELETION.md

# Disconnect Gmail or delete your InstaMail data
DRAFT — replace placeholders and confirm these controls are implemented before publishing.

## Remove one account
1. Open InstaMail and choose Settings.
2. Under Accounts, choose Remove next to the Gmail address.
3. Confirm disconnecting that account.

This stops future InstaMail updates for that account, removes its active connection records and stored credentials, and clears its recent-email cache in the extension. We attempt to stop Google's mailbox watch and revoke the associated access. If Google cannot be reached, the interface explains any remaining provider-side step. Removing the account does not delete any emails from Gmail.

## Delete everything
1. Open Settings → Privacy.
2. Select Disconnect all and delete InstaMail data.
3. Review the connected accounts and confirm.

We disconnect linked accounts, invalidate InstaMail sessions, and remove active account records, credentials and queued events. Temporary operational records and backups expire according to the retention periods in our Privacy Policy; backups expire within 30 days. We will not restore deleted credentials to active service.

## Already uninstalled?
Uninstalling alone does not reliably notify our backend. Email [PRIVACY_EMAIL] with “Delete my InstaMail data”. Use a connected email address where possible. We may ask for proportionate proof of ownership, but never your password, OTP or login link. We will acknowledge and process the request within applicable legal deadlines and explain any legitimate retention requirement.

You can also visit your Google Account's third-party connections settings at https://myaccount.google.com/connections to remove InstaMail's access. This prevents future Google access but does not itself erase records previously held by InstaMail. Send a deletion request as well.

## Before you leave
You can turn off automatic popups without deleting your account: Settings → Automatic sign-in popups → Off. Your inbox and copy-code buttons remain available.

Questions: [SUPPORT_EMAIL]. Privacy details: [PUBLIC_DOMAIN]/privacy.


---

# Source document: 08-LAUNCH-AND-VERIFICATION.md

# InstaMail launch and verification package
Prepared 10 November 2026. Verify live Google requirements immediately before submission. Store review and Google OAuth review are separate; neither is guaranteed by these drafts.

## A. External setup order
1. Reserve actual domain; establish operator identity and support/privacy/security inboxes; complete placeholders.
2. Create separate Google Cloud test and production projects. Enable Gmail API and required Pub/Sub, hosting/key services. Configure billing only through the operator's authorized account.
3. Establish stable Chrome extension ID, exact backend callback and allowlisted chromiumapp.org completion URL. Use a Web Application OAuth client for the specified backend-code flow; never embed its secret in the extension.
4. Configure OAuth branding and external audience; add known test users in development. Declare only openid, email, gmail.readonly. Set permitted redirect URIs exactly. Testing and unverified limits apply; don't represent test consent warnings as the intended public onboarding.
5. Deploy HTTPS API and public homepage/privacy; verify domain ownership through Google's required process. Put the same app identity and contacts everywhere.
6. Create Pub/Sub topic, grant publisher only to gmail-api-push@system.gserviceaccount.com, configure authenticated push subscription/audience/service identity and retry/dead-letter handling. Topic project must match watch-request project requirements. Verify webhook authentication rather than relying on secrecy of endpoint URL.
7. Configure database, Redis, encrypted secrets, scheduler renewals, monitoring and deletion jobs.
8. Test real Gmail across three accounts; collect evidence and record remaining requirements.
9. Prepare OAuth verification in the production project using Google's current console workflow. Publishing the OAuth configuration to Production for review is not evidence of approval or permission to advertise an unrestricted public launch.
10. Submit brand/scope review; when Google directs, complete the assigned security assessment. Budget for annual revalidation and obtain actual assessor quotes; do not invent a fee or fixed timeline.
11. Complete Chrome Web Store developer registration, verified contact, listing assets, privacy practices and permission justifications. Submit real extension build for separate review. Do not publish legal placeholders or screenshots claiming unimplemented behavior.

## B. Scope justification draft
Requested scope: https://www.googleapis.com/auth/gmail.readonly
“InstaMail displays the user's most recent Gmail inbox messages and identifies sign-in codes and links within those messages. Users see email previews and can copy a code or open a link in a visible extension interface. Message body access is required because codes and links commonly appear only in message bodies. Metadata-only access is insufficient. We do not require sending, modifying or deleting messages and do not request those permissions. The backend manages per-account OAuth credentials and Gmail notification watches; the extension normally retrieves and parses message contents. We disclose this architecture and follow Google's Limited Use requirements.”

Appropriate use category: email productivity enhancement. Explain actual benefits and visible features; Google decides eligibility. Do not artificially describe the product as a full compose/send email client. Include architecture diagram, permission mapping and security documentation.

Backend review statement: “Our backend stores encrypted refresh credentials capable of access under gmail.readonly and receives mailbox-change metadata. Email bodies are normally fetched locally by the extension. We are seeking the required security-assessment determination for this complete architecture.” Do not claim an exemption based solely on local parsing.

## C. Google review demo video script
Use test accounts and synthetic messages. Show actual OAuth client/app identity as requested by reviewers, without exposing secrets.
1. Public website and privacy policy, matching InstaMail branding.
2. Fresh installation, welcome disclosure, click Connect Gmail, complete account choice and permission flow.
3. Latest inbox messages load; add a second account; switch and use combined view.
4. Show a synthetic OTP email and exact copy action; show a sign-in link and destination hostname.
5. Show popup closed, synthetic new message delivered, and real automatic popup. Do not edit out an operationally significant delay or use a fake push event as live Gmail evidence.
6. Disable popups; demonstrate inline actions still work and no popup appears for another new message.
7. Change list limit 10→3→1; show settings persist.
8. Remove account and demonstrate deletion/revocation path. Explain backend credentials, metadata, local body processing and retention with a data-flow diagram.
9. Show all OAuth client flows if multiple production clients exist. Keep consent flow readable in English where Google's instructions request it.

## D. Chrome Web Store listing copy
Name: InstaMail
Short description: Recent Gmail emails, sign-in codes and login links in a compact Chrome extension.

Detailed description:
“Your inbox and your sign-in codes, a click away.
InstaMail brings recent emails from your Gmail accounts into your Chrome toolbar. View your latest messages, copy recognized verification codes, and open sign-in links directly from each email row.
• Connect multiple Gmail and Google Workspace accounts.
• View all connected inboxes together or switch accounts.
• Choose to show your latest 1, 3 or 5 emails.
• Copy recognized sign-in codes with one click.
• Open detected sign-in links with the destination hostname visible.
• Enable or disable automatic sign-in popups.
• Use light, dark or system theme.
InstaMail requests read-only Gmail access. It does not send or delete emails or mark messages read. Message contents are normally processed inside the extension. A supporting service manages encrypted account credentials and mailbox-change notifications; those credentials permit Gmail access.
Detection and notification timing depend on message format, Google, your connection and Chrome. Some messages may not be recognized. Chrome must be running to display extension updates. Pin the icon for convenient access.
Privacy: [PUBLIC_DOMAIN]/privacy
Support: [SUPPORT_EMAIL]
InstaMail is independent and not affiliated with Google.”

## E. Permission explanations
identity: starts the user-initiated Google authorization flow and handles the extension return URL.
storage: stores local settings, account identifiers, app session credentials, synchronization checkpoints and bounded session email cache.
alarms: reconnect/recovery maintenance scheduling; not the main new-mail delivery mechanism.
clipboardWrite: copies a verification code only when the user chooses Copy code.
Gmail API host: fetches authorized inbox messages and changes inside the extension.
API host: authenticates connections, refreshes account access and receives event signals.
No all-sites access, cookies access, arbitrary browsing history, webRequest interception or content-script injection is needed for the specified version.

Single purpose statement: “Provide a compact view of the user's Gmail inboxes and make email sign-in codes and links immediately actionable within that view and optional arrival popups.”

## F. Privacy-practices declaration worksheet
Use the actual current dashboard categories; this worksheet is not a substitute for reading them.
- Personally identifiable information: Google account identifiers/email addresses, support correspondence, relevant network information.
- Authentication information: Google OAuth credentials and InstaMail session credentials. Do not describe this as “no authentication information” just because passwords are not requested.
- Personal communications: email sender/recipient, subject, text and links processed in the extension. Local processing does not excuse false data-handling declarations.
- Website content/browsing history: no arbitrary websites read or tracked in this release. Describe Gmail communications accurately under the dashboard's appropriate categories.
- Financial/health information: not intentionally targeted or categorized, but emails may contain sensitive information. Review the dashboard definitions against actual access rather than asserting no sensitive contents could be encountered.
- Data sold/ads/credit uses: none. Certify Limited Use only when the implementation matches.
- Privacy policy URL: exact public URL, no authentication, same operator/app identity.

## G. In-product consent copy
Before Connect Gmail:
“InstaMail needs read-only access to Gmail to show your recent emails and recognize sign-in codes and links. Email contents are normally processed in this extension. Our backend stores encrypted account credentials and receives mailbox-change notifications to keep your accounts connected. These credentials authorize Gmail access. We don't sell Gmail data or use it for ads or general AI training. You can disconnect at any time.”
Links: Privacy Policy; Terms.
Button: Connect Gmail.
Supporting agreement: “By continuing, you agree to the Terms and acknowledge the Privacy Policy.” Ensure this is visibly adjacent to the button, not hidden.

After connection:
“Show sign-in codes automatically” [On]
“New recognized sign-in emails can open a popup while Chrome is active. You can turn this off in Settings.”
Pin hint: “Pin InstaMail in Chrome's Extensions menu to keep your inbox close.”

## H. Release assets and checks
Generate correct manifest icons (16/32/48/128 PNG), branded screenshots showing real shipped UI, store promotional art at the current dashboard-required dimensions, extension ZIP with manifest at root, package/version metadata and reproducible build instructions. Confirm current screenshot dimensions before export.

Production release checks: required placeholders absent; legal policies match actual retention/providers; no remote JS; no secrets/demo fixtures bundled into runtime; least privileges; third-party licenses documented; popup focus behavior validated; account ownership tests passed; reviewers can access functioning demo; full deletion works; emails are not logged; OAuth review and security-assessment status documented; Chrome review status documented.

Website terms and security page support transparency, but are not universally mandated Chrome Store documents. Privacy policy, accurate privacy practices and permission disclosures are central requirements for this data-handling app. Local law may require additional notices or contractual terms depending on operator, audience and hosting; review before public release.

## I. Primary references
Checked 10 November 2026; re-check when implementation begins.
- Gmail scopes: https://developers.google.com/workspace/gmail/api/auth/scopes
- Gmail push, payload/renewal/reliability: https://developers.google.com/workspace/gmail/api/guides/push
- Gmail client synchronization: https://developers.google.com/workspace/gmail/api/guides/sync
- Web-server OAuth/offline credentials: https://developers.google.com/identity/protocols/oauth2/web-server
- Chrome identity: https://developer.chrome.com/docs/extensions/reference/api/identity
- Chrome action/openPopup: https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome popup lifecycle: https://developer.chrome.com/docs/extensions/develop/ui/add-popup
- Chrome service-worker lifecycle: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
- Google OAuth submission: https://support.google.com/cloud/answer/13461325
- Restricted scope verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Security assessment: https://support.google.com/cloud/answer/13465431
- Google Workspace user-data policy: https://developers.google.com/workspace/workspace-api-user-data-developer-policy
- Google API user-data policy: https://developers.google.com/terms/api-services-user-data-policy
- Chrome Store policy: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Store user-data FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
