import prisma from '../../config/prisma.js';

export async function checkAvailability(req, res) {
    try {
        const { roomId } = req.params;
        const { checkIn, checkOut } = req.query;

        if (!roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (start >= end) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room || !room.isActive) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const overlappingBookings = await prisma.booking.count({
            where: {
                roomId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                checkIn: { lt: end },
                checkOut: { gt: start },
            },
        });

        const availableRooms = room.totalRooms - overlappingBookings;

        return res.json({
            roomId,
            checkIn,
            checkOut,
            totalRooms: room.totalRooms,
            bookedRooms: overlappingBookings,
            availableRooms,
            isAvailable: availableRooms > 0,
        });
    } catch (err) {
        console.error('Availability error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}