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
            style="
              background:${BRAND.card};
              border:1px solid ${BRAND.border};
              border-radius:8px;
            ">

            <!-- Header -->
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${BRAND.border};">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <img src="${BRAND.logo}" height="28" alt="${BRAND.name}" />
                          </td>
                          <td style="vertical-align:middle;padding-left:10px;">
                            <span style="
                              font-size:15px;
                              font-weight:600;
                              color:${BRAND.text};
                            ">
                              ${BRAND.name}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="
                      font-size:13px;
                      font-weight:500;
                      color:${accent};
                    ">
                      ${title}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="
                padding:32px;
                color:${BRAND.text};
                font-size:14px;
                line-height:1.65;
              ">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                padding:24px 32px;
                border-top:1px solid ${BRAND.border};
                font-size:12px;
                color:${BRAND.muted};
              ">
                <p style="margin:0 0 6px;">
                  © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                </p>
                <p style="margin:0;">
                  Support: 
                  <a href="mailto:support@ezymotel.in"
                    style="color:${BRAND.text};text-decoration:none;">
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
          <td style="
            padding:10px 0;
            color:${BRAND.muted};
            font-size:13px;
            width:38%;
            border-bottom:${i === rows.length - 1 ? "none" : `1px solid ${BRAND.border}`};
          ">
            ${r.label}
          </td>
          <td style="
            padding:10px 0;
            color:${BRAND.text};
            font-size:13px;
            font-weight:500;
            border-bottom:${i === rows.length - 1 ? "none" : `1px solid ${BRAND.border}`};
          ">
            ${r.value}
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

export function bookingConfirmationTemplate(booking) {
  return baseTemplate({
    title: "Booking Confirmation",
    accent: BRAND.primary,
    content: `
      <p>
        This email confirms that your booking has been successfully created.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room Type", value: booking.room.type },
      { label: "Check-in", value: booking.checkIn.toDateString() },
      { label: "Check-out", value: booking.checkOut.toDateString() },
      { label: "Total Amount", value: `₹${booking.totalPrice}` },
    ])}

      <p style="color:${BRAND.muted};">
        You can manage or cancel your booking from your account dashboard.
      </p>
    `,
  });
}

export function bookingCancellationTemplate(booking) {
  return baseTemplate({
    title: "Booking Cancellation",
    accent: BRAND.danger,
    content: `
      <p>
        This email confirms that your booking has been cancelled.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room Type", value: booking.room.type },
      {
        label: "Stay Dates",
        value: `${booking.checkIn.toDateString()} – ${booking.checkOut.toDateString()}`,
      },
    ])}

      <p style="color:${BRAND.muted};">
        If you believe this cancellation was made in error, please contact support.
      </p>
    `,
  });
}

function formatPaymentMethod(payment) {
  if (payment.method === "CARD" && payment.cardBrand) {
    return `Card (${payment.cardBrand})`;
  }
  if (payment.method === "UPI") return "UPI";
  if (payment.method === "PAYPAL") return "PayPal";
  return payment.method;
}

function paymentLogo(payment) {
  if (payment.method === "CARD" && payment.cardBrand) {
    return `https://img.icons8.com/color/48/${payment.cardBrand.toLowerCase()}.png`;
  }
  if (payment.method === "UPI") {
    return "https://img.icons8.com/color/48/bhim.png";
  }
  if (payment.method === "PAYPAL") {
    return "https://img.icons8.com/color/48/paypal.png";
  }
  return null;
}

export function paymentSuccessTemplate(booking, payment) {
  const methodLabel = formatPaymentMethod(payment);
  const logo = paymentLogo(payment);

  const paymentMethodValue = logo
    ? `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        <img src="${logo}" height="14" alt="${methodLabel}" />
        <span>${methodLabel}</span>
      </span>
    `
    : methodLabel;

  return baseTemplate({
    title: "Payment Receipt",
    accent: BRAND.success,
    content: `
      <p>
        We have received your payment successfully. The details are provided below for your reference.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room Type", value: booking.room.type },
      {
        label: "Stay",
        value: `${booking.checkIn.toDateString()} – ${booking.checkOut.toDateString()}`,
      },
      { label: "Amount Paid", value: `₹${payment.amount}` },
      { label: "Payment Method", value: paymentMethodValue },
      { label: "Payment Status", value: "Completed" },
    ])}

      <p style="color:${BRAND.muted};">
        Please retain this email for your records.
      </p>
    `,
  });
}

export function paymentFailureTemplate(booking) {
  return baseTemplate({
    title: "Payment Failed",
    accent: BRAND.warning,
    content: `
      <p>
        We were unable to process your payment at this time.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room Type", value: booking.room.type },
      { label: "Amount Due", value: `₹${booking.totalPrice}` },
    ])}

      <p style="color:${BRAND.muted};">
        Your booking remains pending. Please retry the payment from your dashboard.
      </p>
    `,
  });
}