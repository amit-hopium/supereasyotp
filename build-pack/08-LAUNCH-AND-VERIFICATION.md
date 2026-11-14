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
