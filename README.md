# 🚕 Ucab — Cab Booking App

A full-stack cab booking web app built with the MERN Stack.

## Tech Stack
- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Auth**: JWT + bcryptjs

## Features
- ✅ User & Driver Registration/Login
- ✅ Real-time Fare Estimation
- ✅ Cab Booking with OTP
- ✅ Ride Status Tracking
- ✅ Booking History
- ✅ Role-based Access Control
- ✅ Responsive Dark UI

## Setup

### 1. Clone the repo
git clone <your-github-link>
cd ucab

### 2. Setup Server
cd server
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev

### 3. Setup Client
cd client
npm install
npm start

### 4. Or run both together
cd ucab
npm run dev

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/user/register | Register user |
| POST | /api/auth/user/login | Login user |
| POST | /api/auth/driver/register | Register driver |
| POST | /api/rides/estimate | Estimate fare |
| POST | /api/rides/book | Book ride |
| GET  | /api/rides/history | Ride history |
| PUT  | /api/rides/:id/status | Update status |
| PUT  | /api/rides/:id/cancel | Cancel ride |

## Team
- Sandip Waghchaure (Team Lead)
- Sarthak Kasar
- Satej Gujar
- Saurav Wani