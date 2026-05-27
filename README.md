# StudyNook Server

> Backend API for StudyNook — a modern study room booking platform built with Express.js, MongoDB, JWT verification, and secure route protection.

---

## 🌐 Live API

- **Server URL:** https://assignment-9-study-nook-server.vercel.app

---

## 🔗 Repository

- **GitHub Repository:** https://github.com/mahdihasanprogrammer/Assignment-9-StudyNook-Server.git

---

# 📖 Project Overview

StudyNook Server powers the backend functionality of the StudyNook platform. It handles room management, booking operations, authentication verification, conflict detection, and protected API routes.

The server is built with Express.js and MongoDB, using JWT verification for secure authorization. It provides RESTful APIs for managing study rooms, handling bookings, preventing overlapping reservations, and controlling user-specific resources securely.

The backend architecture focuses on scalability, clean API structure, and secure data handling for modern full-stack applications.

---

# ✨ Core Features

- 🔐 JWT token verification & protected routes
- 🏢 Add, update, and delete study room listings
- 📅 Booking system with conflict prevention
- 🔎 Search & filter rooms with MongoDB operators
- 📌 User-specific room listings & bookings
- 🚫 Booking cancellation system
- ⚡ RESTful API architecture
- 🌐 Secure CORS & environment variable support

---

# 🛠️ Tech Stack

- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB
- 🔑 JWT Verification
- 🌐 CORS
- 📦 dotenv
- 🔐 jose-cjs

---

# 📦 Main Dependencies

```json
{
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jose-cjs": "^6.2.3",
  "mongodb": "^7.2.0"
}
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=6500
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=your_client_url
```

---

# 🚀 Installation & Setup

```bash
git clone https://github.com/your-username/studynook-server.git
cd studynook-server
npm install
node index.js
```

---

# 🔐 Authentication & Authorization

The server uses JWT verification for securing private routes.

### Protected Route Middleware

- Verifies JWT tokens from Authorization headers
- Prevents unauthorized access
- Attaches authenticated user data to requests

---

# 📅 Booking Conflict Prevention

StudyNook prevents overlapping bookings using MongoDB query operators.

```js
const conflictBooking = await bookingsCollection.findOne({
  roomId: bookingRoom.roomId,
  date: bookingRoom.date,
  status: { $ne: "Cancelled" },
  startTime: { $lt: bookingRoom.endTime },
  endTime: { $gt: bookingRoom.startTime }
})
```

This ensures that multiple users cannot reserve the same room during overlapping time slots.

---

# 🔎 Search & Filter Functionality

### MongoDB Operators Used

| Operator | Purpose |
|----------|---------|
| `$regex` | Search room names |
| `$in` | Filter amenities |
| `$inc` | Update booking counts |
| `$lt` | Booking conflict checking |
| `$gt` | Booking conflict checking |

---

# 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/available-rooms` | Get latest 6 rooms |
| GET | `/all-rooms` | Get all rooms |
| GET | `/all-rooms/:id` | Get room details |
| POST | `/add-room` | Add new room |
| PATCH | `/all-rooms/:id` | Update room |
| DELETE | `/all-rooms/:id` | Delete room |
| POST | `/booking-room` | Book a room |
| GET | `/my-bookings` | Get user bookings |
| PATCH | `/my-bookings/:bookingId` | Cancel booking |

---

# 🌟 Highlights

- Secure JWT verification
- Conflict-free booking logic
- Protected private APIs
- Scalable REST API structure
- MongoDB-powered filtering system

---

# 👨‍💻 Developer

### Mahdi Hasan

Full-Stack Web Developer