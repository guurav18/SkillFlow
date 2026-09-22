const nodemailer = require('nodemailer');

/**
 * Creates and returns configured Nodemailer transport
 */
const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // Useful timeout defaults
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Sends a production-ready verification email
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.verificationToken - Unhashed verification token
 * @returns {Promise<{ success: boolean, messageId?: string, devMode?: boolean }>}
 */
const sendVerificationEmail = async ({ to, name, verificationToken }) => {
  const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
  const fromAddress = process.env.EMAIL_FROM || 'SkillFlow <no-reply@skillflow.com>';

  const transporter = getTransporter();

  // If email transporter is not configured (e.g. local dev without SMTP creds)
  if (!transporter) {
    console.info(`[Email Service (Dev)]: SMTP not configured. Verification link for ${to}: ${verificationUrl}`);
    return { success: true, devMode: true, verificationUrl };
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your SkillFlow email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #334155;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #3157d5; width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: bold; line-height: 44px;">S</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SkillFlow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Verify your email address
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Hi ${name ? name.split(' ')[0] : 'there'},
              </p>
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Thanks for creating an account on SkillFlow. To activate your workspace and begin collaborating, please confirm your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="border-radius: 10px; background-color: #3157d5;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: #3157d5; border: 1px solid #4364e8;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #94a8ad; line-height: 1.5;">
                  ⏱ <strong>Security Notice:</strong> This verification link will expire in <strong>24 hours</strong>. It can only be used once.
                </p>
              </div>

              <!-- Fallback plain text link -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                If the button above does not work, copy and paste this URL into your web browser:
              </p>
              <p style="margin: 0; font-size: 12px; word-break: break-all; color: #818cf8; line-height: 1.4;">
                <a href="${verificationUrl}" style="color: #818cf8; text-decoration: underline;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #172335; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                If you did not sign up for a SkillFlow account, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} SkillFlow Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Welcome to SkillFlow, ${name || 'User'}!

Please verify your email address to activate your account.
Click or open the link below:

${verificationUrl}

This link is valid for 24 hours and can only be used once.

If you did not create a SkillFlow account, please ignore this email.
© ${new Date().getFullYear()} SkillFlow Inc.
`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Verify your email for SkillFlow',
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log safe error without sensitive credentials
    console.error('[Email Service Error]: Failed to send verification email:', error.message);
    throw new Error('Unable to send verification email. Please check configuration or try again.');
  }
};

/**
 * Sends a personalized welcome email upon successful email verification
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.role - 'client' | 'freelancer' | 'admin'
 * @returns {Promise<{ success: boolean, messageId?: string, devMode?: boolean }>}
 */
const sendWelcomeEmail = async ({ to, name, role = 'freelancer' }) => {
  const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const loginUrl = `${frontendUrl}/login?email=${encodeURIComponent(to)}`;
  const fromAddress = process.env.EMAIL_FROM || 'SkillFlow <gauravgupta2506@gmail.com>';

  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[Welcome Email (Dev)]: SMTP not configured. Welcome email simulated for ${to} (${role})`);
    return { success: true, devMode: true };
  }

  const isClient = role === 'client';
  const firstName = name ? name.split(' ')[0] : 'there';

  const subject = isClient
    ? '🎉 Welcome to SkillFlow — Start Building Your Next Big Project!'
    : '🚀 Welcome to SkillFlow — Your Freelance Journey Begins!';

  const roleTitle = isClient ? 'Client' : 'Freelancer';
  const roleHeadline = isClient
    ? 'Ready to scale your next project with top talent?'
    : 'Ready to land high-impact projects & get paid securely?';

  const ctaText = isClient ? 'Post Your First Project' : 'Browse Projects & Get Started';

  const feature1Title = isClient ? 'Post Detailed Projects' : 'Explore Curated Opportunities';
  const feature1Desc = isClient
    ? 'Outline deliverables, budgets, and milestones in minutes to attract top AI, design, and development talent.'
    : 'Apply to verified client projects across AI, Web Development, Design, and more with smart proposals.';

  const feature2Title = isClient ? 'AI-Powered Workflow Intelligence' : 'AI Effort & Milestone Estimator';
  const feature2Desc = isClient
    ? 'Leverage SkillFlow AI to automatically estimate task effort, project health, and smart milestone pacing.'
    : 'Use built-in AI estimation tools to gauge task workload, meet deadlines, and deliver outstanding work.';

  const feature3Title = isClient ? 'Escrow Milestone Protection' : 'Guaranteed Payouts';
  const feature3Desc = isClient
    ? 'Fund milestones in advance with full escrow safety. Only release payments when you are 100% satisfied.'
    : 'Work with peace of mind knowing client funds are deposited in milestones before you start building.';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" max-width="580px" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #334155;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #3157d5; width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: bold; line-height: 44px;">S</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SkillFlow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; background: linear-gradient(180deg, rgba(49, 87, 213, 0.15) 0%, rgba(30, 41, 59, 0) 100%);">
              <span style="display: inline-block; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #818cf8; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px; margin-bottom: 14px;">
                Verified ${roleTitle} Account
              </span>
              <h1 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 24px; font-weight: 700; line-height: 1.3;">
                Welcome to SkillFlow, ${firstName}!
              </h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                ${roleHeadline}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 36px 30px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Thank you for confirming your email and joining the SkillFlow community! Your account is now fully active. Whether you're collaborating on high-impact projects or building cutting-edge software, SkillFlow brings modern AI workflows right to your fingertips.
              </p>

              <!-- Feature Cards -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <!-- Feature 1 -->
                <tr>
                  <td style="padding: 14px 18px; background-color: #0f172a; border: 1px solid #334155; border-radius: 12px;">
                    <strong style="color: #f1f5f9; font-size: 14px; display: block; margin-bottom: 4px;">
                      ✦ ${feature1Title}
                    </strong>
                    <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                      ${feature1Desc}
                    </span>
                  </td>
                </tr>
                <tr><td height="10" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
                <!-- Feature 2 -->
                <tr>
                  <td style="padding: 14px 18px; background-color: #0f172a; border: 1px solid #334155; border-radius: 12px;">
                    <strong style="color: #f1f5f9; font-size: 14px; display: block; margin-bottom: 4px;">
                      ⚡ ${feature2Title}
                    </strong>
                    <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                      ${feature2Desc}
                    </span>
                  </td>
                </tr>
                <tr><td height="10" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
                <!-- Feature 3 -->
                <tr>
                  <td style="padding: 14px 18px; background-color: #0f172a; border: 1px solid #334155; border-radius: 12px;">
                    <strong style="color: #f1f5f9; font-size: 14px; display: block; margin-bottom: 4px;">
                      🛡️ ${feature3Title}
                    </strong>
                    <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                      ${feature3Desc}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 28px auto;">
                <tr>
                  <td style="border-radius: 10px; background-color: #3157d5; text-align: center;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: #3157d5; border: 1px solid #4364e8;">
                      ${ctaText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                Need help getting started? Simply reply to this email or visit our help center anytime.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #172335; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                Welcome aboard! We're excited to have you with us on SkillFlow.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} SkillFlow Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Welcome to SkillFlow, ${firstName}!

Thank you for verifying your email address. Your account is now fully active as a ${roleTitle}.

${roleHeadline}

Highlights:
- ${feature1Title}: ${feature1Desc}
- ${feature2Title}: ${feature2Desc}
- ${feature3Title}: ${feature3Desc}

Get started now:
${loginUrl}

If you have any questions, feel free to reply directly to this email.

Warm regards,
The SkillFlow Team
© ${new Date().getFullYear()} SkillFlow Inc.
`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    console.info(`[Welcome Email]: Sent successfully to ${to} (${role}) [messageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Welcome Email Error]: Failed to send welcome email:', error.message);
    // Don't throw to avoid interrupting user flows
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};
