import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { isDbConnected } from '../config/db.js';
import { sendOTPEmail } from '../services/emailService.js';
import { 
  canResendOTP, 
  generateOTP, 
  verifyOTP as verifyOTPService, 
  isEmailVerified, 
  clearVerification 
} from '../services/otpService.js';
import { validateEmail, validatePassword } from '../utils/validator.js';

// Fallback users for offline development mode when MongoDB is unavailable
const authFallbackUsers = new Map<string, {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super-admin' | 'admin' | 'staff' | 'user';
  password?: string;
  googleId?: string;
}>();

/**
 * Generates a JWT token for the user.
 */
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforsrisakthisarees', {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  });
};

/**
 * Generates a fallback JWT token using the email when DB is offline.
 */
const generateFallbackToken = (email: string): string => {
  return jwt.sign({ id: email }, process.env.JWT_SECRET || 'supersecretjwtkeyforsrisakthisarees', {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  });
};

const getFallbackUserId = (email: string): string => `fallback-${email}`;

/**
 * @desc    Send 6-digit OTP to user's email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email address format.' });
      return;
    }

    // Generate secure 6-digit OTP and save it
    const { otp } = await generateOTP(email);

    // Send the email containing the OTP
    try {
      await sendOTPEmail(email, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email.'
      });
    } catch (emailError: any) {
      console.error('Nodemailer transport error:', emailError);
      console.warn(`\n[OTP FALLBACK] Failed to send email to ${email}. Developer OTP is: ${otp}\n`);
      res.status(200).json({
        success: true,
        message: 'OTP generated. (Check server console since email sending failed).'
      });
    }
  } catch (error: any) {
    console.error('sendOTP Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Resend OTP to user's email (enforcing 60s cooldown limit)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email address format.' });
      return;
    }

    // Enforce 60-second limit
    const allowed = await canResendOTP(email);
    if (!allowed) {
      res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting a new OTP.'
      });
      return;
    }

    // Generate new OTP and invalidate old ones
    const { otp } = await generateOTP(email);

    // Send OTP via Nodemailer
    try {
      await sendOTPEmail(email, otp);
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email.'
      });
    } catch (emailError: any) {
      console.error('Nodemailer resend error:', emailError);
      console.warn(`\n[OTP FALLBACK] Failed to send email to ${email}. Developer OTP is: ${otp}\n`);
      res.status(200).json({
        success: true,
        message: 'OTP generated. (Check server console since email sending failed).'
      });
    }
  } catch (error: any) {
    console.error('resendOTP Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify OTP and mark as verified
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
      return;
    }

    const verification = await verifyOTPService(email, otp);

    if (!verification.success) {
      res.status(400).json({ success: false, message: verification.message });
      return;
    }

    // Check if the user already exists in DB
    if (!isDbConnected) {
      const fallbackUser = authFallbackUsers.get(email);
      if (fallbackUser) {
        res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
          user: {
            _id: fallbackUser._id,
            name: fallbackUser.name,
            email: fallbackUser.email,
            phone: fallbackUser.phone,
            role: fallbackUser.role,
          },
          token: generateFallbackToken(fallbackUser.email),
        });
        return;
      }
      
      // If it's a new email, just return verification success
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        isNewUser: true
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // User exists, so this OTP is verified for a direct login
      // Clear OTP record
      await clearVerification(email);

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
        },
        token: generateToken(existingUser._id.toString()),
      });
      return;
    }

    // New user verification succeeded
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      isNewUser: true
    });
  } catch (error: any) {
    console.error('verifyOTP Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Register a new user (requires verified email OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email address format.' });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      return;
    }

    // Prevent duplicate email registration
    if (!isDbConnected) {
      const existingFallback = authFallbackUsers.get(email);
      if (existingFallback) {
        res.status(400).json({ success: false, message: 'Email is already registered.' });
        return;
      }

      // Check if email OTP verification was done
      const verified = await isEmailVerified(email);
      if (!verified) {
        res.status(400).json({ success: false, message: 'Email address has not been verified.' });
        return;
      }

      // Hash password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const isFirstUser = authFallbackUsers.size === 0;
      const role: 'super-admin' | 'admin' | 'staff' | 'user' = isFirstUser ? 'super-admin' : 'user';

      const fallbackUser = {
        _id: getFallbackUserId(email),
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      };

      authFallbackUsers.set(email, fallbackUser);
      await clearVerification(email);

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        user: {
          _id: fallbackUser._id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          phone: fallbackUser.phone,
          role: fallbackUser.role,
        },
        token: generateFallbackToken(fallbackUser.email),
      });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'Email is already registered.' });
      return;
    }

    // Verify OTP was validated
    const verified = await isEmailVerified(email);
    if (!verified) {
      res.status(400).json({ success: false, message: 'Email address has not been verified.' });
      return;
    }

    // Hash password before saving user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role (first user becomes super-admin)
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'super-admin' : 'user';

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // Clean up OTP record
    await clearVerification(email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error('registerUser Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    if (!isDbConnected) {
      const fallbackUser = authFallbackUsers.get(email);
      if (fallbackUser && fallbackUser.password && (await bcrypt.compare(password, fallbackUser.password))) {
        if (['super-admin', 'admin', 'staff'].includes(fallbackUser.role)) {
          // Log admin login activity in background
          try {
            await ActivityLog.create({
              adminId: new mongoose.Types.ObjectId(),
              adminName: fallbackUser.name,
              actionType: 'login',
              description: `Admin user logged in (fallback): ${fallbackUser.email}`,
              ipAddress: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''),
              userAgent: req.headers['user-agent']
            });
          } catch (logErr) {
            console.error('Failed to log admin login activity:', logErr);
          }
        }

        res.json({
          success: true,
          message: 'Logged in successfully.',
          user: {
            _id: fallbackUser._id,
            name: fallbackUser.name,
            email: fallbackUser.email,
            phone: fallbackUser.phone,
            role: fallbackUser.role,
          },
          token: generateFallbackToken(fallbackUser.email),
        });
        return;
      }

      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      if (['super-admin', 'admin', 'staff'].includes(user.role)) {
        try {
          await ActivityLog.create({
            adminId: user._id,
            adminName: user.name,
            actionType: 'login',
            description: `Admin user logged in: ${user.email}`,
            ipAddress: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''),
            userAgent: req.headers['user-agent']
          });
        } catch (logErr) {
          console.error('Failed to log admin login activity:', logErr);
        }
      }

      res.json({
        success: true,
        message: 'Logged in successfully.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error: any) {
    console.error('loginUser Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Google login / OAuth authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleId, email, name } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required for Google authentication.' });
      return;
    }

    if (!isDbConnected) {
      let fallbackUser = authFallbackUsers.get(email);

      if (fallbackUser) {
        if (!fallbackUser.googleId) {
          fallbackUser.googleId = googleId;
          authFallbackUsers.set(email, fallbackUser);
        }
      } else {
        fallbackUser = {
          _id: getFallbackUserId(email),
          name: name || email.split('@')[0],
          email,
          role: 'user',
          googleId,
        };
        authFallbackUsers.set(email, fallbackUser);
      }

      res.json({
        success: true,
        message: 'Google login successful.',
        user: {
          _id: fallbackUser._id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          phone: fallbackUser.phone,
          role: fallbackUser.role,
        },
        token: generateFallbackToken(fallbackUser.email),
      });
      return;
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create user if not existing
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        role: 'user',
      });
    }

    res.json({
      success: true,
      message: 'Google login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error('googleLogin Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
