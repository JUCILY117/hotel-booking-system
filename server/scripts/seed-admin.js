import bcrypt from 'bcrypt';
import 'dotenv/config';
import prisma from '../config/prisma.js';

async function seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('Admin user already exists');
        return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
        data: {
            name: 'Admin',
            email: adminEmail,
            passwordHash,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created successfully');
}

seedAdmin()
    .catch((err) => {
        console.error('Failed to seed admin:', err);
    })
    .finally(async () => {
        process.exit(0);
    });
