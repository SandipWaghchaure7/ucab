# 🚕 Ucab — Cab Booking System

<div align="center">

[![Ucab Banner](https://img.shields.io/badge/Ucab-Cab%20Booking%20System-F5C518?style=for-the-badge&logo=uber&logoColor=black)](https://github.com/SandipWaghchaure7/ucab)

**A full-stack cab booking web application built with the MERN Stack**

[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

*Vishwakarma Institute of Technology, Pune — 2024–2025*

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Applications](#-applications)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schemas](#-database-schemas)
- [Team](#-team)

---

## 🎯 About the Project

**Ucab** is a real-world full-stack cab booking web application that connects **passengers**, **drivers**, and **admins** through a seamless web interface — no app download required.

Users can book rides by entering pickup/drop-off locations, selecting a cab type, and getting instant fare estimates. Drivers receive ride assignments, update ride status in real-time, and track their earnings. Admins manage the entire platform from a dedicated dashboard.

> Built as a capstone project for the Full Stack Development — MERN Stack program at **Vishwakarma Institute of Technology, Pune**.

---

## 🖥️ Applications

The project consists of **4 separate applications** running concurrently:

| App | Port | Description |
|-----|------|-------------|
| 🧑 **Client** | `3000` | User-facing app — register, book rides, view history |
| 🛡️ **Admin Panel** | `3001` | Admin dashboard — manage users, drivers, rides |
| 🚗 **Driver Panel** | `3002` | Driver app — register, accept rides, track earnings |
| ⚙️ **Backend API** | `5000` | Express REST API — all business logic & database |

---

## ✨ Features

### 👤 User Features
- Register & login with JWT authentication
- 3-step booking flow: Enter locations → Select cab type → Confirm & get OTP
- Real-time fare estimation for all 4 cab types simultaneously
- OTP verification for ride start
- View complete ride history with status & fare details
- Rate driver (1–5 stars) after completed ride
- Profile management

### 🚕 Driver Features
- Register with vehicle information (type, model, plate, color, license)
- Admin verification required before accepting rides
- Verification status synced live — reflects immediately after admin approves
- Online / Offline availability toggle
- View active ride with passenger info, OTP, pickup/dropoff, and fare
- Update ride status: `accepted → arriving → ongoing → completed`
- Track total rides, earnings, and rating
- View complete ride history

### 🛡️ Admin Features
- Dashboard with 8 real-time stat cards (Users, Drivers, Rides, Active, Completed, Cancelled, Unverified, Revenue)
- 7-day revenue & ride volume area chart (Recharts)
- Search users by name or email
- Activate / deactivate user accounts
- Permanently delete users
- Verify / revoke driver accounts
- Filter drivers: All / Verified / Unverified
- Filter rides by status
- Role-based access — admin panel locked to `role=admin` only

### 🔐 Security
- JWT tokens (7-day expiry) stored in localStorage
- bcryptjs password hashing with salt(10)
- Role-based access control: `user`, `driver`, `admin`
- `protect()` middleware + `authorize("admin")` route guards
- Axios interceptor auto-attaches Bearer token & redirects on 401
- CORS whitelisted to ports 3000, 3001, 3002

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React.js | 18.x |
| Client Routing | React Router DOM | 6.x |
| HTTP Client | Axios | 1.x |
| State Management | React Context API | Built-in |
| UI Notifications | react-hot-toast | 2.x |
| Icons | lucide-react | 0.263 |
| Charts | Recharts | 2.x |
| Backend Runtime | Node.js | 16+ |
| Web Framework | Express.js | 4.x |
| Database | MongoDB | 6.x |
| ODM | Mongoose | 7.x |
| Authentication | jsonwebtoken | 9.x |
| Password Hashing | bcryptjs | 2.x |
| Dev Tools | nodemon + concurrently | Latest |

---

## 📁 Project Structure

```
ucab-cab-booking/
├── client/                  ← React user app        (port 3000)
│   └── src/
│       ├── context/         ← AuthContext
│       ├── pages/           ← Login, Register, Home, History, Profile
│       └── api/             ← Axios instance
│
├── server/                  ← Express backend        (port 5000)
│   ├── config/              ← fareConfig.js, seedAdmin.js
│   ├── controllers/         ← authController, rideController, adminController
│   ├── middleware/          ← authMiddleware (protect + authorize)
│   ├── models/              ← User, Driver, Ride, Payment
│   ├── routes/              ← authRoutes, rideRoutes, adminRoutes
│   └── index.js             ← Express app entry point
│
├── admin/                   ← React admin panel      (port 3001)
│   └── src/
│       └── pages/           ← Dashboard, AdminUsers, AdminDrivers, AdminRides
│
├── driver/                  ← React driver panel     (port 3002)
│   └── src/
│       ├── context/         ← DriverAuthContext
│       └── pages/           ← Register, Login, Dashboard, History, Profile
│
├── package.json             ← Root concurrently scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/SandipWaghchaure7/ucab.git
cd ucab
```

**2. Install dependencies for all apps**
```bash
# Root
npm install

# Each app
cd server && npm install && cd ..
cd client && npm install && cd ..
cd admin  && npm install && cd ..
cd driver && npm install && cd ..
```

**3. Set up environment variables**

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ucab
JWT_SECRET=ucab_super_secret_key_2024_do_not_share
FRONTEND_URL=http://localhost:3000
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Create `admin/.env`:
```env
PORT=3001
REACT_APP_API_URL=http://localhost:5000/api
```

Create `driver/.env`:
```env
PORT=3002
REACT_APP_API_URL=http://localhost:5000/api
```

**4. Seed the admin account**
```bash
cd server
node config/seedAdmin.js
cd ..
```

**5. Run all 4 apps together**
```bash
npm run dev
```

### Access the Apps

| App | URL | Credentials |
|-----|-----|-------------|
| User App | http://localhost:3000 | Register a new account |
| Admin Panel | http://localhost:3001 | `admin@ucab.com` / `admin123` |
| Driver Panel | http://localhost:3002 | Register as driver, get verified by admin |
| API | http://localhost:5000 | Test with Thunder Client / Postman |

---

## 🔧 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | server/.env | Backend port (5000) |
| `MONGO_URI` | server/.env | MongoDB connection string |
| `JWT_SECRET` | server/.env | Secret key for JWT signing |
| `FRONTEND_URL` | server/.env | Allowed CORS origin |
| `REACT_APP_API_URL` | client,admin,driver/.env | Backend API base URL |

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/user/register` | Public | Register new user |
| `POST` | `/api/auth/user/login` | Public | Login user |
| `POST` | `/api/auth/driver/register` | Public | Register new driver |
| `POST` | `/api/auth/driver/login` | Public | Login driver |
| `GET` | `/api/auth/profile` | Bearer | Get current profile |

### Ride Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/rides/estimate` | Bearer | Get fare estimates for all cab types |
| `POST` | `/api/rides/book` | Bearer | Book a ride |
| `GET` | `/api/rides/history` | Bearer | Get ride history |
| `GET` | `/api/rides/:id` | Bearer | Get single ride details |
| `PUT` | `/api/rides/:id/status` | Bearer | Update ride status |
| `PUT` | `/api/rides/:id/cancel` | Bearer | Cancel a ride |
| `POST` | `/api/rides/:id/rate` | Bearer | Rate a completed ride |
| `GET` | `/api/rides/driver/active` | Bearer | Get driver's active ride |
| `PUT` | `/api/rides/driver/availability` | Bearer | Toggle driver availability |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics |
| `GET` | `/api/admin/users` | Admin | Get all users |
| `GET` | `/api/admin/drivers` | Admin | Get all drivers |
| `GET` | `/api/admin/rides` | Admin | Get all rides |
| `PUT` | `/api/admin/drivers/:id/verify` | Admin | Verify/revoke driver |
| `PUT` | `/api/admin/users/:id/toggle` | Admin | Toggle user status |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user |

---

## 🗃️ Database Schemas

### Collections
- **users** — name, email, password (hashed), phone, role, isActive
- **drivers** — name, email, vehicle{type,model,plateNumber,color}, licenseNumber, isVerified, isAvailable, rating, totalRides, earnings
- **rides** — user(ref), driver(ref), pickup, dropoff, cabType, status, fare{estimated,final}, otp, paymentStatus, rating
- **payments** — ride(ref), user(ref), driver(ref), amount, method, status, transactionId

### Fare Formula
```
fare = baseFare + (perKm × distanceKm) + (perMin × durationMin)
```

| Cab Type | Base Fare | Per KM | Per Min |
|----------|-----------|--------|---------|
| Mini | ₹30 | ₹10 | ₹1 |
| Sedan | ₹50 | ₹14 | ₹1.5 |
| SUV | ₹80 | ₹18 | ₹2 |
| Auto | ₹20 | ₹7 | ₹0.5 |

---

## 👥 Team

| Name | Role | Email |
|------|------|-------|
| **Sandip Waghchaure** | Team Lead — Frontend, UI, Deployment | sandip.waghchaure22@vit.edu |
| **Sarthak Kasar** | Backend Dev — APIs, Database, Schemas | sarthak.kasar24@vit.edu |
| **Satej Gujar** | Frontend Dev — React, Components, Setup | satej.gujar24@vit.edu |
| **Saurav Wani** | Architect — Architecture, ER Diagram, MVC | saurav.wani24@vit.edu |

---

<div align="center">

**Vishwakarma Institute of Technology, Pune**

*MERN Stack | Full Stack Web Application | 2024–2025*

🔗 [View Repository](https://github.com/SandipWaghchaure7/ucab) &nbsp;|&nbsp; ⭐ Star this repo if you found it helpful!

</div>
