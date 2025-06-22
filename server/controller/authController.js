import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// ======================= Register =======================
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailoptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to MERN Auth by Anish Shetty",
      text: `Hello ${name}, welcome to MERN Auth. Your email is ${email}.`,
    };
    await transporter.sendMail(mailoptions);

    return res.json({ success: true, message: "Registration successful" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Login =======================
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Logout =======================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Send Verify OTP =======================
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "User already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account",
      // text: `Use this OTP to verify your account: ${otp}`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    });

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Verify Email =======================
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Is Authenticated =======================
export const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Send Reset OTP =======================
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset your password",
      // text: `Use this OTP to reset your password: ${otp}`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    });

    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ======================= Verify Reset OTP =======================
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(401).json({ success: false, message: "OTP has expired" });
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= Reset Password =======================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 1. What This Code Does (Overall)
// This file handles 3 major user actions:

// Registering a new user

// Logging in an existing user

// Logging out a logged-in user

// It uses MongoDB (through userModel) to store users, bcrypt to secure passwords, and JWT (JSON Web Tokens) to manage user authentication.

// 👤 2. Register Flow (New User Signup)
// Step-by-Step:
// User Input: The user sends name, email, and password from a form.

// Validation: If any of these fields are missing, the system replies with an error.

// Duplicate Check: It checks if someone with the same email already exists in the database.

// Password Hashing: If the user is new, 
// it encrypts (hashes) the password using bcrypt so no one can see the real password.

// Save User: The new user is saved to the MongoDB database with the encrypted password.

// Token Creation: A token is generated using the user's ID and a secret key.
//  This token is proof that the user is logged in.

// Cookie Setup: This token is stored in a browser cookie, which is secure and only readable by the server.

// Response: A message is sent back saying "registration successful".

// 🔑 3. Login Flow (Existing User Signin)
// Step-by-Step:
// User Input: User enters email and password.

// Validation: If either field is missing, return an error.

// User Lookup: It searches the database for a user with that email.

// Password Comparison: It checks if the entered password matches the stored (hashed) one using bcrypt.

// Token Generation: If it matches, a token is created using the user’s ID.

// Cookie Setup: Like in registration, the token is saved in a cookie with security settings.

// Response: A success message is returned saying "login successful".

// 🚪 4. Logout Flow (Sign Out)
// Step-by-Step:
// Clear Cookie: It deletes the cookie that stores the login token.

// Response: A success message is sent back saying "logout successful".

// 🔐 5. Security Settings Used
// httpOnly Cookie: Can’t be accessed by frontend JavaScript, which helps prevent attacks.

// Secure Cookie: Used only on HTTPS (in production).

// SameSite Setting: Controls whether cookies are sent with cross-site requests. It’s strict in development, relaxed in production.

// Token Expiry: Tokens are set to expire in 7 days.