const BRAND = {
    name: "Ezy Motel",
    logo: "http://localhost:5173/logo.png",
    primary: "#3b82f6",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
    bg: "#0b0f19",
    card: "#111827",
    border: "#1f2933",
    text: "#e5e7eb",
    muted: "#9ca3af",
};

function baseTemplate({ title, accent, content, footer }) {
    return `
  <div style="background:${BRAND.bg};padding:40px 0;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0"
            style="background:${BRAND.card};
            border-radius:16px;
            overflow:hidden;
            border:1px solid ${BRAND.border};">

            <!-- Header -->
            <tr>
              <td style="padding:28px;text-align:center;background:${accent};">
                <img src="${BRAND.logo}" height="38" alt="${BRAND.name}" />
                <h1 style="margin:16px 0 0;
                  color:#ffffff;
                  font-size:22px;
                  font-weight:600;">
                  ${title}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px;color:${BRAND.text};font-size:14px;line-height:1.6;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:22px;
                text-align:center;
                font-size:12px;
                color:${BRAND.muted};
                border-top:1px solid ${BRAND.border};">
                ${footer || `© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.`}
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
    <div style="
      margin:22px 0;
      padding:18px;
      border-radius:12px;
      background:#0f172a;
      border:1px solid ${BRAND.border};
    ">
      ${rows
            .map(
                r => `
          <p style="margin:6px 0;">
            <span style="color:${BRAND.muted};">${r.label}</span><br />
            <strong style="color:${BRAND.text};font-weight:500;">${r.value}</strong>
          </p>
        `
            )
            .join("")}
    </div>
  `;
}

export function signupWelcomeTemplate(user) {
    return baseTemplate({
        title: "Welcome to Ezy Motel 👋",
        accent: BRAND.primary,
        content: `
      <p>
        Hi <strong>${user.name || "there"}</strong>,
      </p>

      <p>
        Welcome to <strong>${BRAND.name}</strong>! Your account has been created successfully.
        You can now explore hotels, manage bookings, and make secure payments — all in one place.
      </p>

      ${infoCard([
            { label: "Account Email", value: user.email },
            { label: "Account Status", value: "Active" },
        ])}

      <p style="color:${BRAND.muted};">
        You can log in anytime and manage everything from your dashboard.
      </p>

      <div style="margin-top:24px;text-align:center;">
        <a href="http://localhost:5173/login"
          style="
            display:inline-block;
            padding:12px 22px;
            border-radius:10px;
            background:${BRAND.primary};
            color:#ffffff;
            text-decoration:none;
            font-weight:500;
            font-size:14px;
          ">
          Go to Dashboard →
        </a>
      </div>
    `,
    });
}

export function emailVerificationTemplate(user, verifyUrl) {
    return baseTemplate({
        title: "Verify your email ✉️",
        accent: BRAND.warning,
        content: `
      <p>
        Hi <strong>${user.name || "there"}</strong>,
      </p>

      <p>
        Thanks for signing up with <strong>${BRAND.name}</strong>.
        Please verify your email address to activate your account.
      </p>

      ${infoCard([
            { label: "Email", value: user.email },
            { label: "Status", value: "Verification required" },
        ])}

      <div style="margin:26px 0;text-align:center;">
        <a href="${verifyUrl}"
          style="
            display:inline-block;
            padding:12px 22px;
            border-radius:10px;
            background:${BRAND.warning};
            color:#000000;
            text-decoration:none;
            font-weight:600;
            font-size:14px;
          ">
          Verify Email
        </a>
      </div>

      <p style="color:${BRAND.muted};font-size:13px;">
        If you didn’t create this account, you can safely ignore this email.
      </p>
    `,
    });
}