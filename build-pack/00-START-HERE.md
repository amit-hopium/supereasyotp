# SuperEasyOTP — build package
Prepared 10 November 2026. Product owner decisions: multiple Gmail / Google Workspace inboxes; legal identity, domain and contacts use placeholders.

## How to use
Copy this entire folder into a new repository. Open `02-CURSOR-PROMPT.md` in Cursor Agent and paste its full contents as the first instruction. Keep every other document available as context. The agent is instructed to implement and test the product, not merely generate a scaffold.

Read order:
1. `01-PRD.md` — product behavior, UX and acceptance criteria.
2. `03-TECHNICAL-SPEC.md` — architecture, contracts, security and deployment.
3. `04-WEBSITE-COPY.md` — complete website content and layout requirements.
4. `05-PRIVACY-POLICY.md`, `06-TERMS.md`, `07-DATA-DELETION.md` — publishable drafts once placeholders are completed and implementation matches.
5. `08-LAUNCH-AND-VERIFICATION.md` — disclosures, listing copy, Google submission and external setup.

## Definition of delivery
A working Chrome extension, service backend, website, migrations, deployment configuration, documented Google setup, automated checks, and release ZIP. A synthetic demo can run without Google credentials, but must be visibly identified as demo data. Live integration must never be presented as complete until real Gmail authorization and push have been tested.

## Scope and constraints
The weekend target is a complete implementation tested with approved test users. Public Gmail OAuth verification and Chrome Web Store review are external processes and are not guaranteed to finish over a weekend. Documents do not guarantee either approval. This is a build specification and legal draft package, not a legal opinion.

Launch is free, without advertising or paid plans. Ads were considered in ideation but are deliberately deferred from this first release; any future introduction requires a separate product decision and updated disclosures. No third-party analytics or hosted AI receives mailbox data.

## Decisions made for implementation
- Gmail only, multiple accounts in one Chrome profile; provider abstraction allows future Outlook support.
- Five latest inbox emails by default, settings allow exactly 1, 3 or 5.
- All-inboxes view is default; limit is total across the selected view, not per account.
- Automatic OTP/sign-in popup is on by default, disclosed during onboarding and immediately switchable off.
- Email bodies are fetched and parsed in the extension. Backend stores encrypted Google refresh tokens and mailbox event metadata, and renews watches.
- Backend credentials confer Gmail access: do not claim the service cannot access email or that all data stays on-device. Budget for restricted-scope verification and annual security assessment.
- Installation opens a welcome page with a clear Connect Gmail action before Google's consent screen. This gives context and an explicit authorization gesture.
- A genuine Chrome action popup supplies the below-icon presentation. Chrome controls placement, dismissal and focus; exact placement cannot be guaranteed if the icon is unpinned or browser UI differs.

## Placeholder register — replace before production
`[LEGAL_OPERATOR_NAME]`, `[BUSINESS_OR_CONTACT_ADDRESS]`, `[SUPPORT_EMAIL]`, `[PRIVACY_EMAIL]`, `[SECURITY_EMAIL]`, `[PUBLIC_DOMAIN]`, `[API_DOMAIN]`, `[CHROME_STORE_URL]`, `[EFFECTIVE_DATE]`, `[GOVERNING_JURISDICTION]`, `[HOSTING_REGION]`, `[INFRASTRUCTURE_PROVIDERS]`.
Deployment must fail its production content check if required placeholders remain. Domain availability and trademark clearance for SuperEasyOTP have not been checked.
