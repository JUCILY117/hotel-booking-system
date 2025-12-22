import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import prisma from "../config/prisma.js";

const BRAND_NAME = "EzyMotel";
const BRAND_DOMAIN = "ezymotel.in";

const UNSPLASH_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

const UPLOAD_BASE = path.resolve("uploads/hotels");
const PLACEHOLDER_IMAGE = "/uploads/hotels/placeholder.jpg";

const PAYMENT_METHODS = ["CARD", "UPI", "PAYPAL"];
const CARD_BRANDS = ["VISA", "MASTERCARD", "AMEX"];

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

async function generateHotelBatch(count, attempt = 1) {
    const MAX_ATTEMPTS = 5;

    console.log(`🧠 Gemini: generating ${count} hotels (attempt ${attempt}/${MAX_ATTEMPTS})`);

    const prompt = `
Generate ${count} unique hotels for a premium hotel booking platform called "${BRAND_NAME}".

Each hotel must include:
- name
- category (boutique, resort, business, heritage)
- tagline (short and premium)
- realistic city and country
- professional, high-quality description suitable for ${BRAND_NAME}
- amenities list
- room descriptions for Standard, Deluxe, Suite, Family
`;

    try {
        const res = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: hotelSchema,
            },
        });

        const data = JSON.parse(res.text);

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Gemini returned empty hotel batch");
        }

        console.log(`✓ Gemini batch received (${data.length})`);
        return data;

    } catch (err) {
        const status = err?.status || err?.error?.code;

        if (
            attempt < MAX_ATTEMPTS &&
            (status === 503 || status === 429 || status === "UNAVAILABLE")
        ) {
            const delay = Math.min(60_000, 5_000 * attempt);

            console.warn(
                `⚠️ Gemini overloaded (status ${status}). Retrying in ${delay / 1000}s...`
            );

            await new Promise(res => setTimeout(res, delay));
            return generateHotelBatch(count, attempt + 1);
        }

        throw err;
    }
}


async function generateHotels(totalCount = 45, batchSize = 5) {
    console.log(`🏨 Generating ${totalCount} hotels in batches of ${batchSize}`);

    const results = [];

    while (results.length < totalCount) {
        const remaining = totalCount - results.length;
        const currentBatchSize = Math.min(batchSize, remaining);

        console.log(
            `→ Batch ${results.length / batchSize + 1}: hotels ${results.length + 1}–${results.length + currentBatchSize}`
        );

        const batch = await generateHotelBatch(currentBatchSize);
        results.push(...batch);

        if (results.length < totalCount) {
            console.log("⏳ Waiting for free-tier rate limit...");
            await new Promise(res => setTimeout(res, 65_000));
        }
    }

    console.log(`✓ Total hotels generated: ${results.length}`);
    return results;
}

const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = arr => arr[rand(0, arr.length - 1)];

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

async function fetchUnsplashImages(query, count = 4) {
    const res = await fetch(
        `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
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
            await fs.writeFile(path.join(dir, fileName), buffer);

            saved.push(`/uploads/hotels/${hotelId}/${fileName}`);
        } catch {
            console.warn(`⚠️ Image download failed for hotel ${hotelId}, using placeholder`);
            saved.push(PLACEHOLDER_IMAGE);
        }
    }

    return saved;
}

async function seed() {
    console.log("🌱 Seeding database started");

    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Database cleared");

    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.user.create({
        data: {
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            passwordHash: adminHash,
            role: "ADMIN",
        },
    });
    console.log("👑 Admin created");

    const userHash = await bcrypt.hash("password123", 10);
    const users = [];

    for (let i = 1; i <= 6; i++) {
        users.push(
            await prisma.user.create({
                data: {
                    name: `User ${i}`,
                    email: `user${i}@${BRAND_DOMAIN}`,
                    passwordHash: userHash,
                    role: "USER",
                },
            })
        );
    }
    console.log(`👤 Users created: ${users.length}`);

    const aiHotels = await generateHotels();

    console.log("🏗 Creating hotels, rooms & images");

    let hotelIndex = 1;
    for (const aiHotel of aiHotels) {
        console.log(`→ Hotel ${hotelIndex++}: ${aiHotel.name}`);

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

        for (const r of [
            { type: "Standard", mul: 1, guests: 2 },
            { type: "Deluxe", mul: 1.4, guests: 2 },
            { type: "Suite", mul: 2, guests: 3 },
            { type: "Family", mul: 1.6, guests: 4 },
        ]) {
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

    console.log("🛏 Rooms created");

    const rooms = await prisma.room.findMany({ where: { isActive: true } });
    console.log(`📦 Active rooms available for booking: ${rooms.length}`);

    for (let i = 1; i <= 8; i++) {
        const user = randomItem(users);
        const room = randomItem(rooms);

        const checkIn = addDays(new Date(), rand(-10, 5));
        const checkOut = addDays(checkIn, rand(1, 4));
        const nights = (checkOut - checkIn) / 86400000;

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

        const method = randomItem(PAYMENT_METHODS);

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: booking.totalPrice,
                method,
                cardBrand: method === "CARD" ? randomItem(CARD_BRANDS) : null,
                status: "SUCCESS",
            },
        });

        console.log(`💳 Booking ${i}/8 created`);
    }

    console.log("🎉 Seed completed successfully");
}

seed()
    .catch(err => {
        console.error("❌ Seed failed:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
