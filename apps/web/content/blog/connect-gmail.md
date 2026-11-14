# Connect Gmail to SuperEasyOTP (tutorial)

This tutorial walks through installing SuperEasyOTP, connecting your first Gmail account, and fixing common setup issues.

## Before you start

- Use **Google Chrome** (version supported by the extension listing).
- Sign in to Chrome with a profile you control.
- Have the Gmail account ready. For **Google Workspace**, ask your admin whether third-party Gmail apps are allowed.

## Step 1 — Install the extension

Install SuperEasyOTP from the Chrome Web Store when the listing is live. During beta, you may load an unpacked build from your operator’s instructions.

Pin the SuperEasyOTP icon to the toolbar so the panel and popups are easy to reach.

## Step 2 — Start Gmail connection

Click the SuperEasyOTP icon and choose **Connect Gmail** (or open the welcome page from the extension menu).

SuperEasyOTP starts a secure OAuth flow with Google. You will see Google’s consent screen—not a custom SuperEasyOTP password form.

## Step 3 — Review permissions

Google will ask for permission to **view your email messages and settings** (read-only). SuperEasyOTP needs this scope to read recent inbox messages and detect verification content. There is no narrower official Gmail scope for “codes only.”

If you decline, the account will not connect. You can disconnect later from SuperEasyOTP Settings or follow our [data deletion guide](/delete-data/).

## Step 4 — Confirm the inbox

After a successful connection, open the panel. You should see recent inbox messages. Use Settings to choose how many messages appear (1, 3, or 10) and whether to enable automatic sign-in popups.

## Add another account

Open Settings → **Add account** and repeat the OAuth flow for each Gmail address. Use the account switcher in the toolbar to view one inbox or combined inboxes.

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| Google shows “Access blocked” | Use a test user approved for beta, or ask a Workspace admin to allow the app. |
| Connected but no mail | Refresh, check the selected account, and confirm the message is in Inbox (not Spam/Trash/archive). |
| Watch unavailable | Reconnect the account; some environments block Gmail push until push endpoints are configured. |

More help: [Support](/support/) or read [How SuperEasyOTP works](/blog/how-it-works/).
