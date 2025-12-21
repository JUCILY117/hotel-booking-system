import fs from 'fs';
import multer from 'multer';
import path from 'path';

const hotelDir = 'uploads/hotels';

if (!fs.existsSync(hotelDir)) {
    fs.mkdirSync(hotelDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, hotelDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

export const uploadHotelImages = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
}).array('images', 5);