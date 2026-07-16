"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.loginUser = exports.registerUser = exports.verifyOTP = exports.resendOTP = exports.sendOTP = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = __importDefault(require("../models/User.js"));
const ActivityLog_js_1 = __importDefault(require("../models/ActivityLog.js"));
const db_js_1 = require("../config/db.js");
const emailService_js_1 = require("../services/emailService.js");
const otpService_js_1 = require("../services/otpService.js");
const validator_js_1 = require("../utils/validator.js");
// Fallback users for offline development mode when MongoDB is unavailable
const authFallbackUsers = new Map();
/**
 * Generates a JWT token for the user.
 */
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    return jsonwebtoken_1.default.sign({ id }, jwtSecret, {
        expiresIn: (process.env.JWT_EXPIRE || '30d'),
    });
};
/**
 * Generates a fallback JWT token using the email when DB is offline.
 */
const generateFallbackToken = (email) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    return jsonwebtoken_1.default.sign({ id: email }, jwtSecret, {
        expiresIn: (process.env.JWT_EXPIRE || '30d'),
    });
};
const getFallbackUserId = (email) => `fallback-${email}`;
/**
 * @desc    Send 6-digit OTP to user's email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email address is required.' });
            return;
        }
        if (!(0, validator_js_1.validateEmail)(email)) {
            res.status(400).json({ success: false, message: 'Invalid email address format.' });
            return;
        }
        // Generate secure 6-digit OTP and save it
        const { otp } = await (0, otpService_js_1.generateOTP)(email);
        // Send the email containing the OTP
        try {
            await (0, emailService_js_1.sendOTPEmail)(email, otp);
            res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email.'
            });
        }
        catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Fallback for local development so developers are not blocked by invalid/missing SMTP credentials
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`\n[OTP FALLBACK] Failed to send email to ${email}. Developer OTP is: ${otp}\n`);
                res.status(200).json({
                    success: true,
                    message: 'OTP generated. (Check server console since email sending failed).',
                    developerWarning: 'Nodemailer failed. OTP logged to console.',
                    error: emailError.message || String(emailError)
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email',
                error: emailError.message || String(emailError)
            });
        }
    }
    catch (error) {
        console.error('sendOTP Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.sendOTP = sendOTP;
/**
 * @desc    Resend OTP to user's email (enforcing 60s cooldown limit)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email address is required.' });
            return;
        }
        if (!(0, validator_js_1.validateEmail)(email)) {
            res.status(400).json({ success: false, message: 'Invalid email address format.' });
            return;
        }
        // Enforce 60-second limit
        const allowed = await (0, otpService_js_1.canResendOTP)(email);
        if (!allowed) {
            res.status(429).json({
                success: false,
                message: 'Please wait 60 seconds before requesting a new OTP.'
            });
            return;
        }
        // Generate new OTP and invalidate old ones
        const { otp } = await (0, otpService_js_1.generateOTP)(email);
        // Send OTP via Nodemailer
        try {
            await (0, emailService_js_1.sendOTPEmail)(email, otp);
            res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email.'
            });
        }
        catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Fallback for local development so developers are not blocked by invalid/missing SMTP credentials
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`\n[OTP FALLBACK] Failed to send email to ${email}. Developer OTP is: ${otp}\n`);
                res.status(200).json({
                    success: true,
                    message: 'OTP generated. (Check server console since email sending failed).',
                    developerWarning: 'Nodemailer failed. OTP logged to console.',
                    error: emailError.message || String(emailError)
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email',
                error: emailError.message || String(emailError)
            });
        }
    }
    catch (error) {
        console.error('resendOTP Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resendOTP = resendOTP;
/**
 * @desc    Verify OTP and mark as verified
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
            return;
        }
        const verification = await (0, otpService_js_1.verifyOTP)(email, otp);
        if (!verification.success) {
            res.status(400).json({ success: false, message: verification.message });
            return;
        }
        // Check if the user already exists in DB
        if (!db_js_1.isDbConnected) {
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
        const existingUser = await User_js_1.default.findOne({ email });
        if (existingUser) {
            // User exists, so this OTP is verified for a direct login
            // Clear OTP record
            await (0, otpService_js_1.clearVerification)(email);
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
    }
    catch (error) {
        console.error('verifyOTP Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyOTP = verifyOTP;
/**
 * @desc    Register a new user (requires verified email OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
            return;
        }
        if (!(0, validator_js_1.validateEmail)(email)) {
            res.status(400).json({ success: false, message: 'Invalid email address format.' });
            return;
        }
        if (!(0, validator_js_1.validatePassword)(password)) {
            res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
            return;
        }
        // Prevent duplicate email registration
        if (!db_js_1.isDbConnected) {
            const existingFallback = authFallbackUsers.get(email);
            if (existingFallback) {
                res.status(400).json({ success: false, message: 'Email is already registered.' });
                return;
            }
            // Check if email OTP verification was done
            const verified = await (0, otpService_js_1.isEmailVerified)(email);
            if (!verified) {
                res.status(400).json({ success: false, message: 'Email address has not been verified.' });
                return;
            }
            // Hash password using bcryptjs
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const isFirstUser = authFallbackUsers.size === 0;
            const role = isFirstUser ? 'super-admin' : 'user';
            const fallbackUser = {
                _id: getFallbackUserId(email),
                name,
                email,
                phone,
                password: hashedPassword,
                role,
            };
            authFallbackUsers.set(email, fallbackUser);
            await (0, otpService_js_1.clearVerification)(email);
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
        const userExists = await User_js_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, message: 'Email is already registered.' });
            return;
        }
        // Verify OTP was validated
        const verified = await (0, otpService_js_1.isEmailVerified)(email);
        if (!verified) {
            res.status(400).json({ success: false, message: 'Email address has not been verified.' });
            return;
        }
        // Hash password before saving user
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Determine role (first user becomes super-admin)
        const isFirstUser = (await User_js_1.default.countDocuments({})) === 0;
        const role = isFirstUser ? 'super-admin' : 'user';
        const user = await User_js_1.default.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        });
        // Clean up OTP record
        await (0, otpService_js_1.clearVerification)(email);
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
    }
    catch (error) {
        console.error('registerUser Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerUser = registerUser;
/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required.' });
            return;
        }
        if (!db_js_1.isDbConnected) {
            const fallbackUser = authFallbackUsers.get(email);
            if (fallbackUser && fallbackUser.password && (await bcryptjs_1.default.compare(password, fallbackUser.password))) {
                if (['super-admin', 'admin', 'staff'].includes(fallbackUser.role)) {
                    // Log admin login activity in background
                    try {
                        await ActivityLog_js_1.default.create({
                            adminId: new mongoose_1.default.Types.ObjectId(),
                            adminName: fallbackUser.name,
                            actionType: 'login',
                            description: `Admin user logged in (fallback): ${fallbackUser.email}`,
                            ipAddress: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''),
                            userAgent: req.headers['user-agent']
                        });
                    }
                    catch (logErr) {
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
        const user = await User_js_1.default.findOne({ email });
        if (user && user.password && (await bcryptjs_1.default.compare(password, user.password))) {
            if (['super-admin', 'admin', 'staff'].includes(user.role)) {
                try {
                    await ActivityLog_js_1.default.create({
                        adminId: user._id,
                        adminName: user.name,
                        actionType: 'login',
                        description: `Admin user logged in: ${user.email}`,
                        ipAddress: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''),
                        userAgent: req.headers['user-agent']
                    });
                }
                catch (logErr) {
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
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    }
    catch (error) {
        console.error('loginUser Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.loginUser = loginUser;
/**
 * @desc    Google login / OAuth authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
    try {
        const { googleId, email, name } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email address is required for Google authentication.' });
            return;
        }
        if (!db_js_1.isDbConnected) {
            let fallbackUser = authFallbackUsers.get(email);
            if (fallbackUser) {
                if (!fallbackUser.googleId) {
                    fallbackUser.googleId = googleId;
                    authFallbackUsers.set(email, fallbackUser);
                }
            }
            else {
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
        let user = await User_js_1.default.findOne({ email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }
        else {
            // Create user if not existing
            try {
                user = await User_js_1.default.create({
                    name: name || email.split('@')[0],
                    email,
                    googleId,
                    role: 'user',
                });
            }
            catch (err) {
                if (err.code === 11000) {
                    // Handled concurrent registration race condition: fetch the existing record instead
                    user = await User_js_1.default.findOne({ email });
                }
                else {
                    throw err;
                }
            }
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
    }
    catch (error) {
        console.error('googleLogin Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.googleLogin = googleLogin;
