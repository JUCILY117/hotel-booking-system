export function bookingConfirmationTemplate(booking) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Booking Confirmed</h2>
      <p>Your booking has been successfully created.</p>

      <hr />

      <p><strong>Hotel:</strong> ${booking.room.hotel.name}</p>
      <p><strong>Room:</strong> ${booking.room.type}</p>
      <p><strong>Check-in:</strong> ${booking.checkIn.toDateString()}</p>
      <p><strong>Check-out:</strong> ${booking.checkOut.toDateString()}</p>
      <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>

      <hr />

      <p>Thank you for booking with us.</p>
    </div>
  `;
}

export function bookingCancellationTemplate(booking) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Booking Cancelled</h2>
      <p>Your booking has been cancelled.</p>

      <hr />

      <p><strong>Hotel:</strong> ${booking.room.hotel.name}</p>
      <p><strong>Room:</strong> ${booking.room.type}</p>
      <p><strong>Dates:</strong> ${booking.checkIn.toDateString()} - ${booking.checkOut.toDateString()}</p>

      <hr />

      <p>If you have questions, contact support.</p>
    </div>
  `;
}

export function paymentSuccessTemplate(booking, payment) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Payment Successful</h2>
      <p>Your booking is now confirmed.</p>

      <hr />

      <p><strong>Hotel:</strong> ${booking.room.hotel.name}</p>
      <p><strong>Room:</strong> ${booking.room.type}</p>
      <p><strong>Check-in:</strong> ${booking.checkIn.toDateString()}</p>
      <p><strong>Check-out:</strong> ${booking.checkOut.toDateString()}</p>
      <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
      <p><strong>Payment Method:</strong> ${payment.method}</p>

      <hr />

      <p>We look forward to hosting you.</p>
    </div>
  `;
}

export function paymentFailureTemplate(booking) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Payment Failed</h2>
      <p>Your payment attempt was unsuccessful.</p>

      <hr />

      <p><strong>Hotel:</strong> ${booking.room.hotel.name}</p>
      <p><strong>Room:</strong> ${booking.room.type}</p>
      <p><strong>Amount Due:</strong> ₹${booking.totalPrice}</p>

      <hr />

      <p>Your booking is still pending. Please try again.</p>
    </div>
  `;
}
