# How SuperEasyOTP works

SuperEasyOTP is a Chrome extension that shows your latest Gmail messages in the toolbar and surfaces sign-in codes and login links when it recognizes them. This page explains the flow in plain language—useful if you are evaluating the product, onboarding a team, or answering “how does this access my mail?”

## What you see in Chrome

After you install the extension and connect a Gmail account, the SuperEasyOTP icon opens a compact panel. You can show one, three, or ten recent inbox messages (not Spam, Trash, or archived mail). When a message looks like a verification or sign-in email, SuperEasyOTP can show a **Copy code** action or an **Open link** action next to that row.

Optional **automatic sign-in popups** can alert you while Chrome is running. You can turn popups off anytime in Settings; the inbox panel still works.

## Connect once, add accounts anytime

1. Install SuperEasyOTP from the Chrome Web Store (or load an approved build during beta).
2. Choose **Connect Gmail** and pick the Google account you want.
3. Review Google’s consent screen. SuperEasyOTP requests read-only Gmail access (`gmail.readonly`) so it can read recent messages to find codes and links. Google does not offer a narrower “OTP-only” scope.
4. Repeat for additional personal or Google Workspace accounts. Workspace admins may need to approve the app.

## Where your email is processed

**Message bodies** for the inbox view are normally fetched and processed **inside the extension** on your device—they are not archived as a mailbox copy on our servers.

Our **backend** stores encrypted OAuth credentials and metadata needed to keep accounts connected, receive Gmail change notifications, and renew watches. It does not maintain a long-term archive of your email bodies or extracted codes for product features.

Because stored credentials can authorize Gmail API access, we restrict server-side use to operating SuperEasyOTP (connection, renewal, notifications). We do not sell Gmail data, use it for ads, or train general-purpose AI models on it. See our [Privacy Policy](/privacy/) for retention, rights, and deletion.

## Notifications and timing

When push notifications are configured, Gmail can signal that new mail arrived. SuperEasyOTP then refreshes and may show a popup for recognized sign-in messages. **Timing is not guaranteed**: delivery depends on the sender, Gmail, your network, and whether Chrome is running.

If Chrome is closed, you will see updates the next time you open it and the extension reconnects.

## What SuperEasyOTP does not do

- It does **not** send, delete, or mark mail as read in Gmail.
- It does **not** replace Gmail’s full interface—it is a small inbox for quick checks and codes.
- Recognized links are **not** proof the sender is legitimate. Always check the address and URL before you act.

## Open source

SuperEasyOTP is developed as an **open source** project. You can inspect the implementation, report issues, and contribute improvements where the license allows. Source links appear on our [homepage](/) when published.

## Related guides

- [Connect Gmail to the Chrome extension](/blog/connect-gmail/)
- [Copy verification codes faster](/blog/verification-codes/)
- [Automatic sign-in popups](/blog/sign-in-popups/)
