import prisma from '../../config/prisma.js';

export async function createRoom(req, res) {
    try {
        const { hotelId, type, description, pricePerNight, maxGuests, totalRooms } = req.body;

        if (!hotelId || !type || !pricePerNight || !maxGuests || !totalRooms) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
        });

        if (!hotel || !hotel.isActive) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const room = await prisma.room.create({
            data: {
                hotelId,
                type,
                description: description || '',
                pricePerNight,
                maxGuests,
                totalRooms,
            },
        });

        return res.status(201).json(room);
    } catch (err) {
        console.error('Create room error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getRoomsByHotel(req, res) {
    try {
        const { hotelId } = req.params;

        const rooms = await prisma.room.findMany({
            where: {
                hotelId,
                isActive: true,
            },
            orderBy: { pricePerNight: 'asc' },
        });

        return res.json(rooms);
    } catch (err) {
        console.error('Get rooms error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateRoom(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        const room = await prisma.room.update({
            where: { id },
            data,
        });

        return res.json(room);
    } catch (err) {
        console.error('Update room error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deactivateRoom(req, res) {
    try {
        const { id } = req.params;

        await prisma.room.update({
            where: { id },
            data: { isActive: false },
        });

        return res.json({ message: 'Room deactivated' });
    } catch (err) {
        console.error('Deactivate room error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function activateRoom(req, res) {
    try {
        const { id } = req.params;

        const room = await prisma.room.update({
            where: { id },
            data: { isActive: true },
        });
        return res.json(room);
    } catch (err) {
        console.error('Activate room error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllRoomsAdmin(req, res) {
    try {
        const rooms = await prisma.room.findMany({
            where: { hotelId: req.params.hotelId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(rooms);
    } catch (err) {
        console.error('Get all rooms error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}