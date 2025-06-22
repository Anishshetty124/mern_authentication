
# MERN Auth Project 🔐

A full-stack authentication system using **MongoDB**, **Express.js**, **React.js**, and **Node.js** with features like:

- 🔑 JWT Cookie-based Auth
- 📧 OTP Email Verification (HTML templates)
- 🔒 Password Reset with OTP
- ✅ Secure and responsive frontend using Tailwind CSS

---

## 🧩 Folder Structure & File Overview

```
mern-auth/
├── client/                  # React Frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # All images/icons used
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context for auth/user state
│   │   ├── pages/           # Auth + UI pages (Login, Register, etc.)
│   │   ├── App.jsx          # Main React app with routing
│   │   └── main.jsx         # Entry point of React app
│   └── vite.config.js       # Vite configuration
│
├── server/                  # Express Backend
│   ├── config/
│   │   ├── nodemailer.js    # Nodemailer transporter setup
│   │   └── emailTemplates.js# HTML email templates (OTP)
│   ├── controller/
│   │   ├── authController.js# Register, Login, OTP logic, etc.
│   │   └── userController.js# Fetch user data (auth-protected)
│   ├── middleware/
│   │   └── userAuth.js      # JWT cookie-based auth middleware
│   ├── models/
│   │   └── userModel.js     # Mongoose user schema
│   ├── routes/
│   │   ├── authRoutes.js    # Routes for /api/auth/*
│   │   └── userRoutes.js    # Routes for /api/user/*
│   ├── .env                 # Environment variables
│   └── server.js            # Main entry point for backend
```

---

## ⚙️ How Components Are Connected

### Frontend (`client/`)

- `App.jsx`: Defines routes (`/login`, `/register`, `/email-verify`, `/reset-password`, etc.)
- `AppContext.jsx`: Provides global `userData` and `isLoggedIn` state.
- Pages like `Login.jsx`, `ResetPassword.jsx`, `EmailVerify.jsx`: Handle form submissions and interact with backend using `axios`.

### Backend (`server/`)

- `server.js`: Connects to MongoDB and mounts Express routes.
- `authRoutes.js`: Contains `/api/auth` routes like register, login, send OTP, verify email, reset password.
- `userRoutes.js`: Contains protected routes like `/api/user/data`.
- `authController.js`: Core logic for user registration, login, OTP, and password reset.
- `userAuth.js`: Middleware to check if the user is logged in via JWT cookie.
- `nodemailer.js`: Nodemailer transporter using environment credentials.
- `emailTemplates.js`: Pre-designed HTML for OTP emails.

---

## 🔑 Authentication Flow

### 1. Register

- User registers with name, email, and password.
- Password is hashed and stored.
- Welcome email is sent.
- JWT token is sent as HTTP-only cookie.

### 2. Login

- User logs in with email + password.
- Password is verified, token issued via cookie.

### 3. Verify Email

- Authenticated users can request a 6-digit OTP.
- OTP is sent via HTML email.
- OTP is verified and `isAccountVerified` flag is updated.

### 4. Reset Password

- User enters email.
- OTP is sent.
- OTP is verified, new password is hashed and saved.

---

## 🌐 Getting Started

### Prerequisites

- Node.js ≥ v18+
- MongoDB (Atlas/local)
- SMTP credentials (like Gmail App Password)

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/mern-auth.git
cd mern-auth
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with Mongo URI, JWT secret, SMTP creds
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

> Ensure both client and server are running on different ports (e.g., `5173`, `4000`).

---

## 🌟 Features Summary

- ✅ User Registration + Login with JWT
- 🧾 HTML Email Templates (custom OTPs)
- 🔐 Secure cookie-based auth
- 📬 Email Verification with OTP
- 🔁 Password Reset with OTP
- ✨ Beautiful Tailwind UI
- 🧠 React Context for global state

---

## 🙌 Made with 💙 by Anish Shetty

> Feel free to fork, modify, and enhance this authentication boilerplate.
