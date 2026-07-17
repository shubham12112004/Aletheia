const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// In Resend free tier, you can only send to verified addresses unless you have a custom domain.
// RESEND_TO_OVERRIDE forces all emails to the developer's verified address during testing.
const FROM_ADDRESS = process.env.RESEND_FROM || 'onboarding@resend.dev';
const TO_OVERRIDE  = process.env.RESEND_TO_OVERRIDE; // set this in .env for dev


/**
 * Send a password reset OTP email.
 * @param {string} toEmail - The user's email
 * @param {string} otp     - The 6-digit OTP code
 * @param {string} name    - The user's display name
 */
async function sendPasswordResetOTP(toEmail, otp, name = 'User') {
  const recipient = TO_OVERRIDE || toEmail;

  if (!resend) {
    // Don’t break the rest of the app if email provider is not configured.
    // OTP is still stored server-side, so once RESEND is configured the user can retry.
    console.warn('[Resend] RESEND_API_KEY is missing. Skipping email sending.');
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: recipient,
    subject: 'Your Aletheia AI Password Reset Code',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#05080f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05080f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#0d1117;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">🧠 Aletheia AI</span>
              </div>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Autonomous Market Intelligence</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#a1a1aa;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Password Reset</p>
              <h1 style="margin:0 0 20px;color:#ffffff;font-size:24px;font-weight:900;line-height:1.2;">Hi ${name}, here's your reset code</h1>
              <p style="margin:0 0 32px;color:#71717a;font-size:14px;line-height:1.6;">
                We received a request to reset your Aletheia AI workspace password. Use the one-time code below. It expires in <strong style="color:#ffffff;">15 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:rgba(5,150,105,0.1);border:2px solid rgba(5,150,105,0.35);border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
                <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#34d399;font-family:monospace;">${otp}</div>
              </div>

              <p style="margin:0 0 16px;color:#52525b;font-size:12px;line-height:1.6;text-align:center;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.05);margin:24px 0;"></div>

              <p style="margin:0;color:#3f3f46;font-size:11px;text-align:center;">
                © 2026 Aletheia AI · Autonomous Market Intelligence Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send OTP email:', error);
    throw new Error('Could not send the reset email. Please try again.');
  }

  console.log('[Resend] OTP email sent. ID:', data?.id);
  return data;
}


module.exports = { sendPasswordResetOTP };
