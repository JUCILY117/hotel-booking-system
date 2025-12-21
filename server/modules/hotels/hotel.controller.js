import prisma from '../../config/prisma.js';

export async function createHotel(req, res) {
    try {
        const { name, location, description, amenities, images } = req.body;

        if (!name || !location || !description) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const hotel = await prisma.hotel.create({
            data: {
                name,
                location,
                description,
                amenities: amenities || [],
                images: images || [],
            },
        });

        return res.status(201).json(hotel);
    } catch (err) {
        console.error('Create hotel error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getHotels(req, res) {
    try {
        const hotels = await prisma.hotel.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(hotels);
    } catch (err) {
        console.error('Get hotels error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getHotelById(req, res) {
    try {
        const { id } = req.params;

        const hotel = await prisma.hotel.findUnique({
            where: { id },
        });

        if (!hotel || !hotel.isActive) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        return res.json(hotel);
    } catch (err) {
        console.error('Get hotel error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateHotel(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        const hotel = await prisma.hotel.update({
            where: { id },
            data,
        });

        return res.json(hotel);
    } catch (err) {
        console.error('Update hotel error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deactivateHotel(req, res) {
    try {
        const { id } = req.params;

        await prisma.hotel.update({
            where: { id },
            data: { isActive: false },
        });

        return res.json({ message: 'Hotel deactivated' });
    } catch (err) {
        console.error('Deactivate hotel error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function uploadHotelImages(req, res) {
    try {
        const { id } = req.params;

        const hotel = await prisma.hotel.findUnique({
            where: { id },
        });

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const imagePaths = req.files.map(
            (file) => `/uploads/hotels/${file.filename}`
        );

        const updatedHotel = await prisma.hotel.update({
            where: { id },
            data: {
                images: {
                    push: imagePaths,
                },
            },
        });

        return res.json(updatedHotel);
    } catch (err) {
        console.error('Upload hotel images error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}