import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import prisma from "../config/prisma.js";

const UNSPLASH_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

const UPLOAD_BASE = path.resolve("uploads/hotels");
const PLACEHOLDER_IMAGE = "/uploads/hotels/placeholder.jpg";

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const hotelSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            name: { type: "string" },
            category: { type: "string" },
            tagline: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            amenities: {
                type: "array",
                items: { type: "string" }
            },
            roomDescriptions: {
                type: "object",
                properties: {
                    Standard: { type: "string" },
                    Deluxe: { type: "string" },
                    Suite: { type: "string" },
                    Family: { type: "string" }
                },
                required: ["Standard", "Deluxe", "Suite", "Family"]
            }
        },
        required: [
            "name",
            "category",
            "tagline",
            "location",
            "description",
            "amenities",
            "roomDescriptions"
        ]
    }
};

async function generateHotels(count = 45) {
    const prompt = `
Generate ${count} unique hotels.
Each hotel must include:
- name
- category (boutique, resort, business, heritage)
- tagline (short)
- realistic city and country
- premium description
- amenities
- room descriptions for Standard, Deluxe, Suite, Family
`;

    const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: hotelSchema,
        },
    });

    return JSON.parse(res.text);
}

const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

async function fetchUnsplashImages(query, count = 4) {
    const res = await fetch(
        `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}`,
        {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_KEY}`,
            },
        }
    );

    if (!res.ok) throw new Error("Unsplash fetch failed");
    const data = await res.json();
    return data.results.map(r => r.urls.regular);
}

async function downloadImages(urls, hotelId) {
    const dir = path.join(UPLOAD_BASE, hotelId);
    await fs.mkdir(dir, { recursive: true });

    const saved = [];

    for (let i = 0; i < urls.length; i++) {
        try {
            const res = await fetch(urls[i]);
            const buffer = Buffer.from(await res.arrayBuffer());

            const fileName = `image-${i + 1}.jpg`;
            const filePath = path.join(dir, fileName);

            await fs.writeFile(filePath, buffer);
            saved.push(`/uploads/hotels/${hotelId}/${fileName}`);
        } catch {
            saved.push(PLACEHOLDER_IMAGE);
        }
    }

    return saved;
}

async function seed() {
    console.log("Seeding database");

    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.user.deleteMany();

    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await prisma.user.create({
        data: {
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            passwordHash: adminHash,
            role: "ADMIN",
        },
    });

    const userHash = await bcrypt.hash("password123", 10);
    const users = [];

    for (let i = 1; i <= 6; i++) {
        users.push(
            await prisma.user.create({
                data: {
                    name: `User ${i}`,
                    email: `user${i}@stayease.com`,
                    passwordHash: userHash,
                    role: "USER",
                },
            })
        );
    }

    const aiHotels = await generateHotels();

    for (const aiHotel of aiHotels) {
        const hotel = await prisma.hotel.create({
            data: {
                name: aiHotel.name,
                location: aiHotel.location,
                description: `${aiHotel.tagline}. ${aiHotel.description}`,
                amenities: aiHotel.amenities,
                isActive: Math.random() > 0.15,
            },
        });

        const imageUrls = await fetchUnsplashImages(
            `${aiHotel.category} hotel ${aiHotel.location}`,
            rand(3, 5)
        );

        const localImages = await downloadImages(imageUrls, hotel.id);

        await prisma.hotel.update({
            where: { id: hotel.id },
            data: { images: localImages },
        });

        const basePrice = rand(2500, 6000);

        const roomTypes = [
            { type: "Standard", mul: 1, guests: 2 },
            { type: "Deluxe", mul: 1.4, guests: 2 },
            { type: "Suite", mul: 2, guests: 3 },
            { type: "Family", mul: 1.6, guests: 4 },
        ];

        for (const r of roomTypes) {
            await prisma.room.create({
                data: {
                    hotelId: hotel.id,
                    type: r.type,
                    description: aiHotel.roomDescriptions[r.type],
                    pricePerNight: Math.round(basePrice * r.mul),
                    maxGuests: r.guests,
                    totalRooms: rand(3, 10),
                    isActive: Math.random() > 0.1,
                },
            });
        }
    }

    const rooms = await prisma.room.findMany({ where: { isActive: true } });

    for (let i = 0; i < 8; i++) {
        const user = users[rand(0, users.length - 1)];
        const room = rooms[rand(0, rooms.length - 1)];

        const checkIn = addDays(new Date(), rand(-10, 5));
        const checkOut = addDays(checkIn, rand(1, 4));

        const nights =
            (checkOut - checkIn) / (1000 * 60 * 60 * 24);

        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                roomId: room.id,
                checkIn,
                checkOut,
                totalPrice: nights * room.pricePerNight,
                status: "CONFIRMED",
            },
        });

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: booking.totalPrice,
                method: "CARD",
                status: "SUCCESS",
            },
        });
    }

    console.log("Seed completed successfully");
}

seed()
    .catch(err => {
        console.error("Seed failed:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
