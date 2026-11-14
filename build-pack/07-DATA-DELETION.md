# Disconnect Gmail or delete your SuperEasyOTP data
DRAFT — replace placeholders and confirm these controls are implemented before publishing.

## Remove one account
1. Open SuperEasyOTP and choose Settings.
2. Under Accounts, choose Remove next to the Gmail address.
3. Confirm disconnecting that account.

This stops future SuperEasyOTP updates for that account, removes its active connection records and stored credentials, and clears its recent-email cache in the extension. We attempt to stop Google's mailbox watch and revoke the associated access. If Google cannot be reached, the interface explains any remaining provider-side step. Removing the account does not delete any emails from Gmail.

## Delete everything
1. Open Settings → Privacy.
2. Select Disconnect all and delete SuperEasyOTP data.
3. Review the connected accounts and confirm.

We disconnect linked accounts, invalidate SuperEasyOTP sessions, and remove active account records, credentials and queued events. Temporary operational records and backups expire according to the retention periods in our Privacy Policy; backups expire within 30 days. We will not restore deleted credentials to active service.

## Already uninstalled?
Uninstalling alone does not reliably notify our backend. Email [PRIVACY_EMAIL] with “Delete my SuperEasyOTP data”. Use a connected email address where possible. We may ask for proportionate proof of ownership, but never your password, OTP or login link. We will acknowledge and process the request within applicable legal deadlines and explain any legitimate retention requirement.

You can also visit your Google Account's third-party connections settings at https://myaccount.google.com/connections to remove SuperEasyOTP's access. This prevents future Google access but does not itself erase records previously held by SuperEasyOTP. Send a deletion request as well.

## Before you leave
You can turn off automatic popups without deleting your account: Settings → Automatic sign-in popups → Off. Your inbox and copy-code buttons remain available.

Questions: [SUPPORT_EMAIL]. Privacy details: [PUBLIC_DOMAIN]/privacy.
