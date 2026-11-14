# Automatic sign-in popups in SuperEasyOTP

Automatic popups surface **new** sign-in or verification messages while Chrome is running—so you can copy a code without opening Gmail.

## Turn popups on or off

Open SuperEasyOTP **Settings** and find **Automatic sign-in popups** (or notification delivery). Choices typically include:

- **Toolbar popup** — compact panel near the extension icon.
- **Chrome notification** — system notification (depending on build and OS permissions).
- **Off** — no alerts; the inbox panel still works when you click the icon.

Changes should apply immediately, including suppressing queued alerts when you turn the feature off.

## When a popup appears

A popup usually follows a **Gmail change notification** and SuperEasyOTP’s detection rules. The message should be recent and look like a verification email. Older mail, newsletters, or ambiguous text normally stay in the inbox list only.

**Popups are not instant by guarantee.** Latency depends on Gmail delivery, push configuration, network, and Chrome activity.

## Pin the icon

For toolbar popups, pin SuperEasyOTP so Chrome does not hide the icon in the puzzle menu. Notifications may still work if you chose that delivery mode and allowed Chrome notification permission.

## Quiet hours and focus

If a popup would interrupt deep work, disable automatic popups and check the icon when you expect a code. SuperEasyOTP is designed to respect a global off switch; per-account overrides cannot force alerts when global off is set.

## Security reminder

A popup only means SuperEasyOTP **recognized** something that looks like a code or link. It does **not** prove the email is authentic. Phishing exists. Verify the sender and destination. Report suspicious mail through Gmail, not through SuperEasyOTP.

## Learn more

- [How SuperEasyOTP works](/blog/how-it-works/)
- [Security overview](/security/)
- [Support](/support/)
