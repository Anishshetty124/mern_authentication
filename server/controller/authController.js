// Controllers for: Register, Login, Logout
// Required modules
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import transporter from "../config/nodemailer.js";
// ======================= Register =======================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input fields
  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT token with user ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    // Set JWT token in cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Enables HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Cookie policy based on environment
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });

    //send welcome email
    const mailoptions={
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Welcome to MERN Auth by Anish shetty",
      html:'<h2>Hello '+name+' Welcome to MERN Auth by Anish shetty,by your email id '+email+".</h2>"
    }  

    await transporter.sendMail(mailoptions);

    return res.json({ success: true, message: "Registration successful" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ======================= Login =======================
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set JWT token in cookie
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
    // Clear token cookie on logout
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


// ======================= Send Verify Otp =======================
export const sendVerifyOtp=async(req,res)=>{
  try{
      //we get user id from request body 
      // in this case,it is got from cookie's token which we saved
      // we fetch it by userauth middleware
    const {userId}=req.body;
    const user=await userModel.findById(userId);
    if(!user){
      return res.json({success:false,message:"User not found"})
    }
    if(user.isAccountVerified){
      return res.json({success:false,message:"User is already verified"})
    }
    
    //math.floor will avoid decimal values
    const otp=String(Math.floor(10000+ Math.random()*900000));
    //saving otp in database
    user.verifyOtp=otp;
    user.verifyOtpExpireAt=Date.now()+24*60*60*1000;

    await user.save();

    //send otp via email
    const mailoptions={
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Verify your account",
      html:'<h2>Use this otp to verify your account '+otp+".</h2>"
    }  

    await transporter.sendMail(mailoptions);
    res.json({success:true,message:"Otp sent successfully"})

  }catch(error){
    res.json({success:false,message:error.message})
  }
}

//
export const verifyEmail=async(req,res)=>{
   const {userId,otp}=req.body;
   if(!userId || !otp){
    return res.json({success:false,message:"All fields are required"})
   }
   
   
   try {
     const user=await userModel.findById(userId);
     
     if(!user){
       res.json({success:false,message:"User not found"})
     }
     //check if otp is valid
     if(user.verifyOtp === "" || user.verifyOtp !== otp){
      return res.json({success:false,message:"invalid otp"})
     }
  
     //check if otp is expired
     if(user.verifyOtpExpireAt < Date.now()){
      return res.json({success:false,message:"otp expired"})
     }

     user.isAccountVerified=true;
     user.verifyOtp="";
     user.verifyOtpExpireAt=0;
     await user.save();
     res.json({success:true,message:"Email verified successfully"})


   } catch (error) {
    res.json({success:false,message:error.message})
   }
}



//====================== Is Authenticated =======================
export const isAuthenticated=async(req,res)=>{
  try {
    res.json({success:true,message:"User is authenticated"})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const sendResetOtp=async(req,res)=>{
  const {email}=req.body;
  if(!email){
    return res.json({success:false,message:"Email is required"})
  }

  try {

    const user=await userModel.findOne({email});
    
    if(!user){
      return res.json({success:false,message:"User not found"})
    }
    
    const otp=String(Math.floor(10000+ Math.random()*900000));
    //saving otp in database
    user.resetOtp=otp;
    user.resetOtpExpireAt=Date.now()+24*60*60*1000;
    await user.save();

    //send otp via email
    const mailoptions={
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Reset your password",
      html:'<h2>Use this otp to reset your password: '+otp+".</h2>"
    }

    await transporter.sendMail(mailoptions);
    return res.json({success:true,message:"Otp sent successfully"})

  } catch (error) {
    res.json({success:false,message:error.message})
  }
} 



export const resetPassword=async(req,res)=>{

  const {email,otp,newPassword}=req.body;
  
  if(!email || !otp || !newPassword){
    return res.json({success:false,message:"All fields are required"})
  }

  try {
    
    const user=await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"User not found"})
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
      return res.json({success:false,message:"invalid otp"})
     }
  
     //check if otp is expired
     if(user.resetOtpExpireAt < Date.now()){
      return res.json({success:false,message:"otp expired"})
     }

     const hashedPassword=await bcrypt.hash(newPassword,10);
     user.password=hashedPassword;
     user.resetOtp="";
     user.resetOtpExpireAt=0;
     await user.save();
     res.json({success:true,message:"Password reset successfully"})


  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

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