# SuperEasyOTP Privacy Policy
DRAFT — replace placeholders and confirm deployed behavior before publication. Remove this editorial line only after review.
Effective date: [EFFECTIVE_DATE]

## Summary

SuperEasyOTP helps you read recent Gmail and surface sign-in codes and links from a Chrome extension. This policy describes what we access, where it is processed, how long we keep it, and the choices you have. We designed SuperEasyOTP so that **inbox message bodies are normally processed on your device**, while our backend keeps encrypted connection data needed to maintain Gmail access and change notifications—not a mailbox archive.

We follow [Google’s API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including Limited Use requirements. We do not sell Google user data, use it for ads, or train general-purpose AI models on it.

## Who we are
SuperEasyOTP is operated by [LEGAL_OPERATOR_NAME], at [BUSINESS_OR_CONTACT_ADDRESS] (“we”, “us”). This policy explains how we handle information when you use our Chrome extension, website and supporting services. Contact [PRIVACY_EMAIL] with privacy questions or requests.

## What SuperEasyOTP does
SuperEasyOTP connects to Gmail accounts you authorize, displays recent inbox emails, and identifies possible verification codes and sign-in links. You can connect multiple accounts and choose whether recognized sign-in messages open an automatic extension popup.

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
SuperEasyOTP’s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including its Limited Use requirements, and applicable Google Workspace and Chrome Web Store user-data policies.

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
You can disable automatic popups, change the email display limit, remove individual Gmail accounts, or disconnect all accounts and request deletion in Settings. See [PUBLIC_DOMAIN]/delete-data for instructions and alternatives. You can revoke Google access through your Google Account's third-party connections settings. Revocation stops future authorized Google access but is not itself a deletion request for records already held by SuperEasyOTP.

Uninstalling the extension alone does not notify us reliably or delete your backend account. Disconnect before uninstalling, or contact [PRIVACY_EMAIL] afterward.

Depending on where you live, you may have rights to access, correct, delete, restrict or object to processing, receive a copy of your information, withdraw consent, or complain to a relevant data-protection authority. We will respond as required by applicable law and may request proportionate identity verification. Email [PRIVACY_EMAIL]. Where required, we rely on your consent for authorized Gmail access, providing the requested service for related processing, legitimate interests for proportionate security/operations, and legal obligations where applicable. Withdrawal does not make previous lawful processing unlawful.

## International processing
Information may be processed in [HOSTING_REGION] and in locations used by the listed providers. Where applicable law requires safeguards for international transfers, we will use appropriate safeguards and disclose further details on request.

## Children
SuperEasyOTP is not directed to children under 13 or any higher minimum age required by applicable local law. We do not knowingly seek their personal information. Contact us if you believe a child has provided information inappropriately.

## Website storage
The public information website does not use behavioral advertising cookies or tracking pixels. Necessary authentication/session mechanisms may be used on service endpoints. If these practices change, we will update the policy and obtain consent where required before introducing the new processing.

## Changes
We will update the effective date when this policy changes. For material changes, we will provide appropriate notice. If we change our use of Google user data beyond what you authorized, we will obtain the consent required by Google's policies and applicable law before using it that way.

## Related resources

- [Delete your data](/delete-data/) — disconnect accounts and remove SuperEasyOTP records
- [Security](/security/) — how we protect credentials and handle mail locally
- [Terms of Service](/terms/) — rules for using SuperEasyOTP
- [Docs](/docs/) — product guides and reference

## Contact
[LEGAL_OPERATOR_NAME]
[BUSINESS_OR_CONTACT_ADDRESS]
Privacy: [PRIVACY_EMAIL]
Support: [SUPPORT_EMAIL]
