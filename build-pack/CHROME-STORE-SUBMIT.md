# Chrome Web Store — submit checklist

Use after `pnpm store:ready` succeeds.

## Upload

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) → **New item** (or your draft).
2. Upload **`supereasyotp-extension.zip`** from the repo root (produced by `pnpm extension:zip`).
3. **Privacy policy:** `https://supereasyotp.com/privacy/`
4. **Homepage:** `https://supereasyotp.com`
5. **Support:** `amit@hopiumstudio.com`

## Listing

**Name:** SuperEasyOTP

**Short description:** Recent Gmail emails, sign-in codes and login links in a compact Chrome extension.

**Detailed description:** (paste)

Your inbox and your sign-in codes, a click away.

SuperEasyOTP brings recent emails from your Gmail accounts into your Chrome toolbar. View your latest messages, copy recognized verification codes, and open sign-in links directly from each email row.

- Connect multiple Gmail and Google Workspace accounts.
- View all connected inboxes together or switch accounts.
- Choose to show your latest 1, 3 or 5 emails.
- Copy recognized sign-in codes with one click.
- Open detected sign-in links with the destination hostname visible.
- Enable or disable automatic sign-in popups.
- Use light, dark or system theme.

SuperEasyOTP requests read-only Gmail access. It does not send or delete emails or mark messages read. Message contents are normally processed inside the extension. A supporting service manages encrypted account credentials and mailbox-change notifications.

Privacy: https://supereasyotp.com/privacy/  
Support: amit@hopiumstudio.com  
SuperEasyOTP is independent and not affiliated with Google.

## Single purpose

Provide a compact view of the user's Gmail inboxes and make email sign-in codes and links immediately actionable within that view and optional arrival popups.

## Permission justifications

| Permission | Why |
|------------|-----|
| `identity` | User-initiated Google OAuth and return to the extension. |
| `storage` | Settings, account list, session cache, sync checkpoints. |
| `alarms` | Reconnect / maintenance scheduling. |
| `clipboardWrite` | Copy verification code when the user taps Copy. |
| `notifications` | Optional alert when sign-in mail is recognized (if enabled in build). |
| `https://gmail.googleapis.com/*` | Read inbox messages the user authorized. |
| API host (production) | OAuth exchange, sessions, account sync, push fan-out. |

## Privacy practices (dashboard)

Declare honestly: user identifiers and email addresses, authentication tokens, personal communications (email content processed in the extension), no sale/ads use of Gmail data, Limited Use aligned with Google policy.

## Reviewer notes

- Production API: `https://api.hopiumstudio.com`
- Test: install extension → **Connect Gmail** → approve `gmail.readonly` → recent inbox loads.
- OAuth app may show “unverified” until Google scope review completes; add reviewer as **test user** in Google Cloud if needed.

## After first publish

1. Copy the live Chrome Web Store URL into `build-pack/legal.env` → `CHROME_STORE_URL=...`
2. `pnpm build`, push to GitHub (Vercel redeploy) so site “Add to Chrome” buttons work.

## Still separate (Google, not Chrome)

Submit **OAuth verification** for `gmail.readonly` using `build-pack/08-LAUNCH-AND-VERIFICATION.md` sections B and C (demo video). Store listing can go in parallel; public users need OAuth approval for unrestricted install.