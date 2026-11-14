# SuperEasyOTP
Chrome MV3 extension, Fastify OAuth/push service, and static website. One Gmail test account has connected successfully; automatic push delivery has not yet been tested.

## Try the interface
```
pnpm install
pnpm build
pnpm exec vite preview --outDir apps/web/dist --port 4173
```
Open http://localhost:4173. The homepage embeds an interactive demo with synthetic emails. Chrome → Extensions → Developer mode → Load unpacked → `apps/extension/dist` installs the real extension, which requires the API below.

## Connect Gmail
1. `docker compose -p supereasyotp -f infra/compose.yaml up -d`
2. Copy `.env.example` to `.env`. Create a 32-byte key with `openssl rand -base64 32` and put it in TOKEN_KEY. Keep it secret and backed up; changing it makes existing tokens unreadable.
3. Configure a Google web OAuth client, Gmail API, known test users and `openid email gmail.readonly`. Register `https://<EXTENSION_ID>.chromiumapp.org/` and optionally `https://<API_HOST>/oauth/google/callback` on the Google web OAuth client. Put the actual unpacked Chrome extension ID in EXTENSION_ID.
4. Create the Gmail Pub/Sub topic and authenticated push subscription. Grant Gmail’s publisher identity access to the topic. Set PUSH_IDENTITY, PUBSUB_SUBSCRIPTION and PUBSUB_TOPIC. Push audience must exactly match `API_URL/internal/pubsub/gmail`.
5. Run `node --env-file=.env --import tsx apps/api/server.ts`. Build with `node --env-file=.env --import tsx scripts/build.ts` so the extension contains your API_URL and SITE_URL. Reload the unpacked extension.
6. Schedule authenticated daily POST `/internal/jobs/renew-watches` with SCHEDULER_IDENTITY and that exact endpoint as audience.
7. Connect each Gmail account separately. Validate real deliveries and focus behavior before relying on automatic popups.

## Checks and outputs
- `pnpm typecheck`
- `pnpm test`
- `node --import tsx scripts/api-check.ts` (requires local Compose services; creates and removes synthetic test rows)
- `pnpm build`
- `pnpm extension:zip` → `supereasyotp-extension.zip`
- API: `apps/api/dist/server.js`; website: `apps/web/dist`; extension: `apps/extension/dist`.

## Chrome Web Store finish line

1. `pnpm store:ready` — builds production extension ZIP and checks legal + API config.
2. Upload `supereasyotp-extension.zip` using **`build-pack/CHROME-STORE-SUBMIT.md`** (copy-paste listing + permissions).
3. Google OAuth scope review is separate; use demo script in **`build-pack/08-LAUNCH-AND-VERIFICATION.md`** (sections B–C).

Live site: https://supereasyotp.com · API: https://api.hopiumstudio.com

See `build-pack/` for legal copy and launch verification drafts.

## Low-cost push pilot deployment
The production Compose stack, HTTPS proxy, isolated Postgres/Redis network, production environment template, and Google Pub/Sub/Cloud Scheduler setup sequence are in `docs/PUSH-DEPLOYMENT.md`. Run `pnpm production:check` before deployment. This is deployable configuration, not a live service: a VPS, DNS record, Google service accounts, authenticated push subscription, and scheduler job still need to be created.

## Google Cloud test setup (10 November 2026)
- Project: `pragmatic-armor-514309-t6` (SuperEasyOTP).
- OAuth branding: External, Testing, support/contact `amit@hopiumstudio.com`.
- OAuth web client: `SuperEasyOTP local development`, callback `http://localhost:8787/oauth/google/callback`; private ID/secret are in `.env`.
- Scope list: `openid`, email, `gmail.readonly`; test users: `amit@hopiumstudio.com` and `hopiumcreativestudio@gmail.com`.
- Gmail and Pub/Sub APIs enabled. Topic: `projects/pragmatic-armor-514309-t6/topics/instamail-gmail-events` (legacy GCP id). Pull subscription: `projects/pragmatic-armor-514309-t6/subscriptions/instamail-gmail-local`, one-day message retention. This retains events for setup; no live relay consumes it yet.
- Local API responded on `/readyz`, and `/v1/oauth/start` generated the registered Google callback.

Gmail's publisher identity now has Pub/Sub Publisher on the topic. The `hopiumstudio.com` Domain Restricted Sharing policy is restored to inherit from the organization. The Gmail watch for `hopiumcreativestudio@gmail.com` registered successfully on 10 November 2026 and expires on 17 November 2026. For local operator renewal, run `pnpm watch:renew:local`; production needs authenticated daily scheduler delivery.

The local OAuth API is running and its `/readyz` check passes. Reload the installed extension manually from `chrome://extensions`, then complete Google consent as `amit@hopiumstudio.com`. The backend verifies Gmail profile access; if watch registration is blocked, the account is marked `watch-unavailable`, and manual inbox refresh can still be tested. Automatic push delivery also needs a public HTTPS endpoint, an authenticated push subscription and scheduled watch renewal.

Live test on 10 November 2026: `hopiumcreativestudio@gmail.com` connected successfully and the user confirmed recent messages matched Gmail. The account watch is now active. Automatic arrival alerts still need a push subscription that sends events to a publicly reachable HTTPS API; the current subscription is pull-only and has no consumer.
