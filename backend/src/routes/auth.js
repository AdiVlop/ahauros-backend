import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
// import User from "../models/User.js"; // Disabled - no MongoDB

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// SIGNUP endpoint - DISABLED (no MongoDB)
router.post("/signup", async (req, res) => {
  res.status(503).json({ error: "Authentication service temporarily unavailable" });
});

/* DISABLED - MongoDB dependency
router.post("/signup", async (req, res) => {
  try {
    const { company, regNumber, name, email, phone, password } = req.body;

    // Validation
    if (!company || !regNumber || !name || !email || !password) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      company,
      regNumber,
      name,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update user with verification token
    user.verificationToken = verificationToken;
    await user.save();

    // Create verification link
    const verifyLink = `${process.env.FRONTEND_URL}/auth?verify=${verificationToken}`;

    // Send verification email
    try {
      await transporter.sendMail({
        from: `"Ahauros AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Confirm your Ahauros AI account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e0bd40;">Welcome to Ahauros AI, ${name}!</h2>
            <p>Thank you for signing up. Please confirm your account by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #e0bd40; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Account</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verifyLink}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Ahauros AI - Intelligent e-commerce optimization platform</p>
          </div>
        `
      });

      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      message: "Signup successful. Please check your email to confirm your account.",
      userId: user._id
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// VERIFY EMAIL endpoint
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.verified) {
      return res.json({ message: "Email already verified. You can login now." });
    }

    // Mark as verified
    user.verified = true;
    user.verificationToken = null;
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({ 
      message: "Email verified successfully. You can login now.",
      verified: true
    });

  } catch (error) {
    console.error("❌ Verification error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Verification token has expired. Please sign up again." });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: "Invalid verification token." });
    }

    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// LOGIN endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(401).json({ 
        error: "Please verify your email first. Check your inbox for the verification link." 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        company: user.company,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        company: user.company,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET USER PROFILE (protected route)
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -verificationToken');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });

  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// FORGOT PASSWORD — send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a reset link was sent." });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { email: user.email, type: "reset" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      await transporter.sendMail({
        from: `"Ahauros AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Ahauros AI password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e0bd40;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #e0bd40; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Ahauros AI - Intelligent e-commerce optimization platform</p>
          </div>
        `
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Password reset email failed:", emailError);
      return res.status(500).json({ error: "Failed to send reset email" });
    }

    res.json({ message: "Reset link sent if email exists." });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// RESET PASSWORD — apply new password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    // Verify reset token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    if (payload.type !== "reset") {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Find user
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password reset for user: ${user.email}`);

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Reset token has expired" });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.status(500).json({ error: "Reset failed" });
  }
});
*/

export default router;
