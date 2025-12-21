export function canCancelBooking(booking) {
    if (booking.status === 'CANCELLED') return false;

    if (booking.status === 'PENDING') return true;

    if (booking.status === 'CONFIRMED') {
        const now = new Date();
        const diffMs = booking.checkIn.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        return diffHours >= 24;
    }

    return false;
}