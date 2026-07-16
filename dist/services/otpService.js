"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearVerification = exports.isEmailVerified = exports.verifyOTP = exports.generateOTP = exports.canResendOTP = void 0;
const OTP_js_1 = __importDefault(require("../models/OTP.js"));
const db_js_1 = require("../config/db.js");
// In-memory fallback database for OTPs (when MongoDB is offline)
const fallbackOtps = new Map();
/**
 * Checks if a user is allowed to request a new OTP for their email.
 * Enforces a 60-second cool-down period.
 *
 * @param email The target email
 * @returns Promise<boolean> True if resend is allowed, false if within cool-down
 */
const canResendOTP = async (email) => {
    const coolDownMs = 60 * 1000; // 60 seconds
    if (!db_js_1.isDbConnected) {
        const existing = fallbackOtps.get(email);
        if (!existing)
            return true;
        const elapsed = Date.now() - existing.createdAt.getTime();
        return elapsed >= coolDownMs;
    }
    // Find the latest OTP sent to this email address
    const latestOtp = await OTP_js_1.default.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOtp)
        return true;
    const elapsed = Date.now() - latestOtp.createdAt.getTime();
    return elapsed >= coolDownMs;
};
exports.canResendOTP = canResendOTP;
/**
 * Generates a new secure 6-digit OTP, invalidates any existing OTPs for the email,
 * and saves the new OTP to MongoDB (or fallback cache).
 *
 * @param email The recipient email
 * @returns Promise<{ otp: string; expiresAt: Date }>
 */
const generateOTP = async (email) => {
    // Generate secure 6-digit OTP (e.g. 100000 to 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    if (!db_js_1.isDbConnected) {
        // Invalidate old entry by overwriting
        fallbackOtps.set(email, {
            otp,
            createdAt: new Date(),
            expiresAt,
            verified: false,
        });
        return { otp, expiresAt };
    }
    // Invalidate (delete) all old OTPs for this email address before creating a new one
    await OTP_js_1.default.deleteMany({ email });
    // Save new OTP record
    await OTP_js_1.default.create({
        email,
        otp,
        expiresAt,
        verified: false,
    });
    return { otp, expiresAt };
};
exports.generateOTP = generateOTP;
/**
 * Verifies a 6-digit OTP code against the database or fallback memory cache.
 * Marks the OTP as verified if valid and not expired.
 *
 * @param email The recipient email
 * @param otpCode The 6-digit OTP code input
 * @returns Promise<{ success: boolean; message: string }> Verification status and description
 */
const verifyOTP = async (email, otpCode) => {
    if (!otpCode || otpCode.length !== 6) {
        return { success: false, message: 'OTP must be exactly 6 digits.' };
    }
    if (!db_js_1.isDbConnected) {
        const record = fallbackOtps.get(email);
        if (!record || record.verified) {
            return { success: false, message: 'Invalid OTP request or code already verified.' };
        }
        if (record.otp !== otpCode) {
            return { success: false, message: 'Incorrect OTP code.' };
        }
        if (new Date() > record.expiresAt) {
            return { success: false, message: 'OTP has expired.' };
        }
        // Mark as verified
        record.verified = true;
        fallbackOtps.set(email, record);
        return { success: true, message: 'OTP verified successfully.' };
    }
    // Find the OTP document in MongoDB
    const record = await OTP_js_1.default.findOne({ email, otp: otpCode, verified: false });
    if (!record) {
        return { success: false, message: 'Incorrect OTP code.' };
    }
    if (new Date() > record.expiresAt) {
        return { success: false, message: 'OTP has expired.' };
    }
    // Mark as verified in MongoDB
    record.verified = true;
    await record.save();
    return { success: true, message: 'OTP verified successfully.' };
};
exports.verifyOTP = verifyOTP;
/**
 * Checks if the email verification step has been completed for registration.
 *
 * @param email The target email
 * @returns Promise<boolean> True if verified, false otherwise
 */
const isEmailVerified = async (email) => {
    if (!db_js_1.isDbConnected) {
        const record = fallbackOtps.get(email);
        return !!(record && record.verified);
    }
    const record = await OTP_js_1.default.findOne({ email, verified: true });
    return !!record;
};
exports.isEmailVerified = isEmailVerified;
/**
 * Clears the verified OTP record after successful registration.
 *
 * @param email The verified email
 */
const clearVerification = async (email) => {
    if (!db_js_1.isDbConnected) {
        fallbackOtps.delete(email);
        return;
    }
    await OTP_js_1.default.deleteMany({ email });
};
exports.clearVerification = clearVerification;
