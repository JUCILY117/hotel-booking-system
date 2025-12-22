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
              <td style="
                padding:22px;
                text-align:center;
                font-size:12px;
                color:${BRAND.muted};
                border-top:1px solid ${BRAND.border};
              ">
                <p style="margin:0 0 6px;">
                  © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                </p>

                <p style="margin:0 0 6px;">
                  This invoice was generated automatically. No signature required.
                </p>

                <p style="margin:0;">
                  Need help? 
                  <a href="mailto:support@ezymotel.in"
                    style="color:${BRAND.primary};text-decoration:none;">
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

export function bookingConfirmationTemplate(booking) {
  return baseTemplate({
    title: "Booking Confirmed 🎉",
    accent: BRAND.primary,
    content: `
      <p>
        Your booking has been successfully created. We’re excited to host you!
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room", value: booking.room.type },
      { label: "Check-in", value: booking.checkIn.toDateString() },
      { label: "Check-out", value: booking.checkOut.toDateString() },
      { label: "Total Price", value: `₹${booking.totalPrice}` },
    ])}

      <p style="color:${BRAND.muted};">
        You can manage or cancel your booking anytime from your dashboard.
      </p>
    `,
  });
}

export function bookingCancellationTemplate(booking) {
  return baseTemplate({
    title: "Booking Cancelled",
    accent: BRAND.danger,
    content: `
      <p>
        Your booking has been cancelled as requested.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room", value: booking.room.type },
      {
        label: "Dates",
        value: `${booking.checkIn.toDateString()} → ${booking.checkOut.toDateString()}`,
      },
    ])}

      <p style="color:${BRAND.muted};">
        If this was a mistake, please contact our support team.
      </p>
    `,
  });
}

function formatPaymentMethod(payment) {
  if (payment.method === "CARD" && payment.cardBrand) {
    return `Card (${payment.cardBrand})`;
  }
  if (payment.method === "UPI") {
    return "UPI";
  }
  if (payment.method === "PAYPAL") {
    return "PayPal";
  }
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

  return baseTemplate({
    title: "Payment Successful ✅",
    accent: BRAND.success,
    content: `
      <p>
        Your payment was successful and your booking is now confirmed.
      </p>

      ${logo ? `
        <div style="text-align:center;margin:14px 0;">
          <img src="${logo}" height="36" alt="${methodLabel}" />
        </div>
      ` : ""}

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room", value: booking.room.type },
      {
        label: "Stay",
        value: `${booking.checkIn.toDateString()} → ${booking.checkOut.toDateString()}`,
      },
      { label: "Amount Paid", value: `₹${payment.amount}` },
      { label: "Payment Method", value: methodLabel },
      { label: "Payment Status", value: "SUCCESS" },
    ])}

      <p style="color:${BRAND.muted};">
        We look forward to hosting you. Have a great stay!
      </p>
    `,
  });
}


export function paymentFailureTemplate(booking) {
  return baseTemplate({
    title: "Payment Failed ⚠️",
    accent: BRAND.warning,
    content: `
      <p>
        Unfortunately, your payment attempt was unsuccessful.
      </p>

      ${infoCard([
      { label: "Hotel", value: booking.room.hotel.name },
      { label: "Room", value: booking.room.type },
      { label: "Amount Due", value: `₹${booking.totalPrice}` },
    ])}

      <p style="color:${BRAND.muted};">
        Your booking is still pending. Please retry the payment from your dashboard.
      </p>
    `,
  });
}
