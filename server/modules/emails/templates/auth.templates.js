const BRAND = {
  name: "Ezy Motel",
  logo: `${process.env.CLIENT_URL}/logo.png`,

  primary: "#1f2937",
  success: "#166534",
  danger: "#991b1b",
  warning: "#92400e",

  bg: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",

  text: "#111827",
  muted: "#6b7280",
};

function baseTemplate({ title, accent, content }) {
  return `
  <div style="background:${BRAND.bg};padding:40px 0;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="640" cellspacing="0" cellpadding="0"
            style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:8px;">

            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${BRAND.border};">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <img src="${BRAND.logo}" height="28" alt="${BRAND.name}" />
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-size:15px;font-weight:600;color:${BRAND.text};">
                              ${BRAND.name}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="font-size:13px;font-weight:500;color:${accent};">
                      ${title}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;color:${BRAND.text};font-size:14px;line-height:1.65;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.muted};">
                <p style="margin:0 0 6px;">
                  © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                </p>
                <p style="margin:0;">
                  Support:
                  <a href="mailto:support@ezymotel.in" style="color:${BRAND.text};text-decoration:none;">
                    support@ezymotel.in
                  </a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function infoCard(rows) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="margin:24px 0;border-collapse:collapse;">
      ${rows.map((r, i) => `
        <tr>
          <td style="padding:10px 0;color:${BRAND.muted};font-size:13px;width:38%;
            border-bottom:${i === rows.length - 1 ? "none" : `1px solid ${BRAND.border}`};">
            ${r.label}
          </td>
          <td style="padding:10px 0;color:${BRAND.text};font-size:13px;font-weight:500;
            border-bottom:${i === rows.length - 1 ? "none" : `1px solid ${BRAND.border}`};">
            ${r.value}
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

export function signupWelcomeTemplate(user) {
  return baseTemplate({
    title: "Account Created",
    accent: BRAND.primary,
    content: `
      <p>
        Hello ${user.name || "there"},
      </p>

      <p>
        Your account has been successfully created with ${BRAND.name}. You can now
        browse properties, manage bookings, and make secure payments.
      </p>

      ${infoCard([
      { label: "Account Email", value: user.email },
      { label: "Account Status", value: "Active" },
    ])}

      <p style="color:${BRAND.muted};">
        Access your account at any time from your dashboard.
      </p>

      <p style="margin-top:24px;">
        <a href="${process.env.CLIENT_URL}/login"
          style="color:${BRAND.primary};text-decoration:none;font-weight:500;">
          Sign in to your account
        </a>
      </p>
    `,
  });
}

export function emailVerificationTemplate(user, verifyUrl) {
  return baseTemplate({
    title: "Email Verification Required",
    accent: BRAND.warning,
    content: `
      <p>
        Hello ${user.name || "there"},
      </p>

      <p>
        Please verify your email address to complete your account setup with ${BRAND.name}.
      </p>

      ${infoCard([
      { label: "Email Address", value: user.email },
      { label: "Verification Status", value: "Pending" },
    ])}

      <p style="margin:24px 0;">
        <a href="${verifyUrl}"
          style="color:${BRAND.primary};text-decoration:none;font-weight:500;">
          Verify email address
        </a>
      </p>

      <p style="color:${BRAND.muted};font-size:13px;">
        If you did not create this account, you may safely ignore this email.
      </p>
    `,
  });
}
