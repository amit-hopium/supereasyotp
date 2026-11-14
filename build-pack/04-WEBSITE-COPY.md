# SuperEasyOTP website draft and implementation brief
Status: ready for implementation; replace placeholders and validate every claim against shipped behavior before publishing. This is the complete copy specification, not a deployed website.

## Design and routes
A fast, simple static website. Responsive 1120px max content width; generous whitespace, matching extension colors, system/local fonts, clear focus states and light/dark support. Avoid tracking pixels, third-party embeds, autoplay and analytics SDKs. Use realistic synthetic inbox UI screenshots, explicitly marked illustrative until real release screenshots exist. No fake reviews, user counts, guarantees, security badges or “Google approved” language.
Routes: /, /privacy, /terms, /delete-data, /support, /security. All legal pages are public and directly reachable without sign-in. Footer on every page links to all routes and names the operator. Same owned domain for homepage/privacy. Render main content statically for reviewers and accessibility.

## Homepage
Page title: SuperEasyOTP — Your inbox, a click away
Meta description: Check recent emails across your Gmail accounts. Copy sign-in codes and open login links directly from a compact Chrome extension.

Navigation: SuperEasyOTP | How it works | Privacy | Support | Add to Chrome
The installation button must use the real store listing after approval. Before approval, label it “Coming to Chrome” and link to a short availability explanation; never simulate a completed install. Do not collect waitlist addresses without implementing a separate consent/retention policy.

Hero eyebrow: A little less switching. A little more flow.
Hero headline: Your inbox. Your sign-in code. Right here.
Hero body: Check your latest emails, copy a verification code, or open a sign-in link—all from your Chrome toolbar. Connect your personal and work Gmail accounts and keep moving.
Primary CTA: Add to Chrome
Secondary CTA: See how it works (anchor)
Supporting line: Free to use. Built for Chrome and Gmail.

Hero illustration: Native toolbar icon above a compact SuperEasyOTP panel. Synthetic row: “Example App · Your sign-in code · just now”, code “004291”, Copy code. Second row: a routine email. Label: Illustrative preview. Never use a real login link.

Feature section heading: The useful part of your inbox, without the detour.
Feature 1 title: Your latest emails, at a glance.
Body: See your newest five emails in a condensed view. Prefer an even smaller inbox? Choose three or one in Settings.
Feature 2 title: Codes and links, ready to use.
Body: When SuperEasyOTP recognizes a sign-in code or link, it places the action beside the email. Copy the code or open the link with a click.
Feature 3 title: Your accounts, together.
Body: Connect multiple Gmail accounts. View them together or switch to one inbox, with the recipient account clearly shown.
Feature 4 title: A popup when you want it.
Body: Enable automatic sign-in popups to see new codes as they arrive while Chrome is active. Turn them off whenever you prefer to check mail yourself.

How it works heading: Connect once. Keep your flow.
Step 1: Add SuperEasyOTP to Chrome.
Text: Open the welcome screen and choose Connect Gmail.
Step 2: Choose your Google account.
Text: Review the access request and connect an account. Add another whenever you need it.
Step 3: Check mail—or let the code come to you.
Text: Click the icon for recent emails. With automatic popups enabled, recognized sign-in messages can appear in a compact toolbar popup.

Privacy section heading: Know what you’re connecting.
Body: SuperEasyOTP requests read-only Gmail access to find recent emails and sign-in messages. Message contents are normally fetched and processed inside the extension. Our backend manages encrypted account credentials and mailbox-change notifications to keep accounts connected. It does not maintain an archive of your email bodies or codes.
Second paragraph: Because these credentials authorize Gmail access, the service has the technical ability to access your connected mailbox. We restrict that access to providing SuperEasyOTP. Gmail data is not sold, used for advertising, or used to train general AI models.
Link: Read our privacy policy.

FAQ:
Q: Which email accounts can I connect?
A: Gmail and Google Workspace accounts. Your Workspace administrator may need to approve access. Other email providers are not supported in this release.
Q: Can I use more than one account?
A: Yes. Add each Gmail account separately and switch between them or use All inboxes.
Q: Will codes appear instantly?
A: SuperEasyOTP uses Gmail change notifications to surface recognized sign-in messages promptly. Timing depends on the sender, Gmail, your connection and Chrome. Delivery and detection are not guaranteed to be instant.
Q: Can I turn off the popups?
A: Yes. Turn off automatic sign-in popups in Settings. Your recent emails and inline code/link actions remain available.
Q: Does it work when Chrome is closed?
A: The extension displays updates while Chrome is running. When you return, it reconnects and refreshes your inbox.
Q: Does SuperEasyOTP change my emails?
A: No. This release reads email; it does not send, delete or mark messages as read in Gmail.
Q: Why does Google ask for access to my Gmail?
A: Gmail does not offer permission limited only to OTP emails. Read-only message access is needed to recognize codes in the email body. You can disconnect at any time.
Q: How do I disconnect and delete data?
A: Open Settings to remove an account or choose Disconnect all and delete data. You can also contact us. Uninstalling the extension alone does not delete your server account. See the deletion guide.
Q: Is SuperEasyOTP made by Google?
A: No. SuperEasyOTP is an independent product operated by [LEGAL_OPERATOR_NAME].

Final CTA heading: Keep the code close.
Body: A small inbox for the moments you need it.
Button: Add to Chrome (same real-listing rule).
Footer: © [CURRENT_YEAR] [LEGAL_OPERATOR_NAME]. SuperEasyOTP is not affiliated with or endorsed by Google. Gmail, Google Workspace and Chrome are trademarks of Google LLC.

## /support
Title: How can we help?
Intro: For connection problems, missing codes or feedback, contact [SUPPORT_EMAIL].
Troubleshooting:
- Can't connect? Check that you selected the correct Google account and granted Gmail access. A managed account may require administrator approval.
- No popup? Check Settings → Automatic sign-in popups, pin the icon, and make sure Chrome is active. Ambiguous or older messages may appear in the inbox without an alert.
- Missing email? Refresh and check the account selector. SuperEasyOTP shows recent inbox mail, not Spam, Trash or archived messages.
- Connection expired? Choose Reconnect next to that account.
- Clipboard didn't work? Retry Copy code or select and copy the code manually.
Support request note: Tell us your extension version, Chrome version and a description. Never send passwords, live OTPs, sign-in links or full email contents. Redact sensitive information from screenshots.
Links: Privacy, Delete your data, Report a security issue.

## /security
Title: Security at SuperEasyOTP
Body: SuperEasyOTP handles account-access information. We use encrypted transport, restricted infrastructure access and encrypted storage for retained Google credentials. Message contents are normally processed inside the extension rather than archived on our servers. Our backend receives mailbox-change metadata and manages account access and notification watches.
Body: No system can guarantee perfect security. Do not treat a recognized email or link as proof of its sender's legitimacy. Check the sender and destination before acting.
Reporting: Report suspected vulnerabilities privately to [SECURITY_EMAIL]. Include reproducible steps using synthetic or your own test data. Do not access other people's data. We will acknowledge reports when practicable; no response-time or bounty promise is made.
Review status: Show only factual, evidenced status. Do not display certification badges, “CASA certified”, “Google approved” or audit claims until appropriate review is completed and wording is authorized.

## Legal routes
/privacy renders 05-PRIVACY-POLICY.md without internal editorial notes.
/terms renders 06-TERMS.md without internal editorial notes.
/delete-data renders 07-DATA-DELETION.md without internal editorial notes.
Production checks require real operator/contact/domain/effective date/jurisdiction/hosting values. Keep legal pages text-selectable and printable. Do not hide policies inside accordion panels or require cookies to view them.
