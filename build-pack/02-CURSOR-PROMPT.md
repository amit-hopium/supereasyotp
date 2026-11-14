# Paste this entire prompt into Cursor Agent

Build SuperEasyOTP completely from the specification documents in this folder. This is an implementation request: create working application code, backend, static website, deployment assets, tests and release artifacts. Work through the whole scope; do not stop after scaffolding or a plan.

Read 00-START-HERE.md, 01-PRD.md, 03-TECHNICAL-SPEC.md, 04-WEBSITE-COPY.md, 05-PRIVACY-POLICY.md, 06-TERMS.md, 07-DATA-DELETION.md and 08-LAUNCH-AND-VERIFICATION.md before coding. Treat the PRD as product authority, technical spec as engineering authority, and legal copy as drafts that must match actual behavior. Record and resolve inconsistencies; never silently change privacy architecture or reduce UX to timed inbox polling.

SuperEasyOTP supports multiple Gmail/Workspace accounts in a single Chrome profile. Clicking the extension shows latest 5 emails by default; users choose 1/3/5. Each row surfaces high-confidence OTPs and sign-in links with copy/open actions. New OTP/sign-in mail automatically opens a compact native Chrome toolbar popup when enabled, including when the extension UI was closed. Turning it off preserves email reading and inline detection. Build this exact product.

Use the stack and repo layout from the technical spec. Verify current primary documentation before using version-sensitive APIs. Read repository instructions before changing files. Create an isolated supereasyotp application directory if working in an unrelated existing repository. Never overwrite unrelated work.

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
