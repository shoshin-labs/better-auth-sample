import { Resend } from "resend";

type EmailTemplate =
  | "email-verification"
  | "password-reset"
  | "magic-link"
  | "otp"
  | "org-invitation";

interface SendEmailParams {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

function getEmailHtml(template: EmailTemplate, data: Record<string, unknown>): string {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const buttonStyle = `
    display: inline-block;
    padding: 12px 24px;
    background-color: #0070f3;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
  `;

  switch (template) {
    case "email-verification":
      return `
        <div style="${baseStyle}">
          <h1>Verify your email</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>Please click the button below to verify your email address:</p>
          <p style="margin: 24px 0;">
            <a href="${data.url}" style="${buttonStyle}">Verify Email</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `;

    case "password-reset":
      return `
        <div style="${baseStyle}">
          <h1>Reset your password</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin: 24px 0;">
            <a href="${data.url}" style="${buttonStyle}">Reset Password</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `;

    case "magic-link":
      return `
        <div style="${baseStyle}">
          <h1>Sign in to Better Auth Demo</h1>
          <p>Click the button below to sign in:</p>
          <p style="margin: 24px 0;">
            <a href="${data.url}" style="${buttonStyle}">Sign In</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 10 minutes.
          </p>
        </div>
      `;

    case "otp":
      return `
        <div style="${baseStyle}">
          <h1>Your verification code</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 24px 0;">
            ${data.otp}
          </p>
          <p style="color: #666; font-size: 14px;">
            This code expires in 5 minutes.
          </p>
        </div>
      `;

    case "org-invitation":
      return `
        <div style="${baseStyle}">
          <h1>You've been invited!</h1>
          <p>${data.inviterName} has invited you to join <strong>${data.organizationName}</strong> as a ${data.role}.</p>
          <p style="margin: 24px 0;">
            <a href="${data.inviteLink}" style="${buttonStyle}">Accept Invitation</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This invitation expires in 48 hours.
          </p>
        </div>
      `;

    default:
      return `<p>${JSON.stringify(data)}</p>`;
  }
}

export async function sendEmail({ to, subject, template, data }: SendEmailParams) {
  // Always log to console for debugging
  console.log("=".repeat(50));
  console.log("EMAIL SENT");
  console.log("=".repeat(50));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Template: ${template}`);
  console.log(`Data:`, JSON.stringify(data, null, 2));
  console.log("=".repeat(50));

  // If Resend API key is configured, send real emails
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Better Auth Demo <onboarding@resend.dev>",
        to,
        subject,
        html: getEmailHtml(template, data),
      });
      console.log("Resend result:", result);
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      throw error;
    }
  }
}
