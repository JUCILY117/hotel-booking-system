# 🏨 Hotel Booking System

A full-stack hotel booking system built using **React, Node.js, Express, PostgreSQL, and Prisma**.  
This project includes authentication, hotel & room management, bookings, demo payments, email notifications, admin dashboard, and AI-generated demo data.

---

## ✨ Features

### User Features

-   User authentication using JWT (HttpOnly cookies)
-   Browse hotels with cover images
-   View hotel details and available rooms
-   Check room availability by date
-   Book rooms
-   Demo payment flow
-   Booking confirmation & cancellation emails
-   View personal bookings

### Admin Features

-   Admin authentication & protected routes
-   Create, deactivate & reactivate hotels
-   Create, deactivate & reactivate rooms
-   View all bookings
-   Basic admin analytics dashboard

### System Features

-   PostgreSQL database with Prisma ORM
-   Local image uploads (no external hotlinking)
-   Static image serving via Express
-   AI-generated seed data (Gemini + Unsplash)
-   Fully local development setup

---

## 🧱 Tech Stack

### Frontend

-   React (Vite)
-   React Router
-   Axios
-   Tailwind CSS
-   Framer Motion
-   Dark / Light theme support

### Backend

-   Node.js
-   Express
-   Prisma ORM
-   PostgreSQL
-   JWT Authentication
-   Bcrypt
-   Nodemailer
-   Static file serving

### Tools

-   Prisma Studio
-   Mailpit (local email testing)
-   Unsplash API (demo images)
-   Gemini API (AI-generated demo data)

---

## 📁 Project Structure

```

hotel-booking-system/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── utils/
│   │   └── api/
│   ├── .env
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── modules/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── uploads/                # Local uploaded images
│   ├── config/
│   ├── server.js
│   ├── prisma.config.js
│   ├── .env
│   └── package.json
│
└── README.md

```

---

## 🛠 Prerequisites

Make sure you have the following installed:

-   Node.js (v18 or higher)
-   PostgreSQL (local prefered unless hosting)
-   Git
-   Mailpit

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hotel_booking
JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

UNSPLASH_ACCESS_KEY=your_unsplash_key
GEMINI_API_KEY=your_gemini_key
```

---

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Backend Setup

```bash
cd server
npm install
```

### Run database migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### Open Prisma Studio (optional)

```bash
npx prisma studio
```

### Seed the database (admin, users, hotels, rooms, bookings)

```bash
#you need to configure unspalsh and gemini in env

node prisma/seed.js
```

### Start backend server

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

## 🎨 Frontend Setup

```bash
cd client
npm install
```

### Start frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🖼 Image Handling

-   Hotel images are downloaded locally during seeding
-   Stored in:

```
server/uploads/hotels/
```

-   Served statically by Express:

```
http://localhost:5000/uploads/...
```

-   Frontend resolves image URLs via a global media resolver

---

## 📧 Email Testing (Mailpit)

If Mailpit is running:

```bash
mailpit
```

(if not then install it via https://mailpit.axllent.org/docs/install/)

Access inbox at:

```
http://localhost:8025
```

All booking confirmation & cancellation emails appear here.

---

## 🔐 Authentication Notes

-   JWT stored in **HttpOnly cookies**
-   No tokens stored in localStorage
-   Admin routes are role-protected
-   Session is validated via backend API

---

## 🤖 AI Seed Data

-   Gemini API generates realistic hotel & room descriptions
-   Unsplash API provides hotel images
-   All images are downloaded locally for offline use
-   Seed size can be increased safely (20–50 hotels recommended)

---

## 📌 Default Admin Credentials

After seeding:

```
Email: admin@example.com
Password: admin123
```

(Change via `.env`)

---

## 📚 Notes for Evaluation

-   Fully local setup (no paid services required)
-   Clean separation of frontend & backend
-   Production-ready patterns used
-   Easy to extend with real payments or cloud storage

---

## ✅ Completed So Far

-   Backend API (auth, hotels, rooms, bookings, payments)
-   Admin dashboard
-   Email system
-   Image uploads & serving
-   AI-powered database seeding
-   Frontend hotel listing & detail pages
-   Dark/light theme foundation

---

## 🔜 Possible Enhancements

-   Real payment gateway integration
-   Ratings & reviews
-   Search & filters
-   Pagination
-   Cloud image storage
-   Deployment (Docker / VPS)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
