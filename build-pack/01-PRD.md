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
