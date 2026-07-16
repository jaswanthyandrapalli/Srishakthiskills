import OTP from '../models/OTP.js';
import { isDbConnected } from '../config/db.js';

// In-memory fallback database for OTPs (when MongoDB is offline)
const fallbackOtps = new Map<string, {
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}>();

/**
 * Checks if a user is allowed to request a new OTP for their email.
 * Enforces a 60-second cool-down period.
 * 
 * @param email The target email
 * @returns Promise<boolean> True if resend is allowed, false if within cool-down
 */
export const canResendOTP = async (email: string): Promise<boolean> => {
  const coolDownMs = 60 * 1000; // 60 seconds

  if (!isDbConnected) {
    const existing = fallbackOtps.get(email);
    if (!existing) return true;
    const elapsed = Date.now() - existing.createdAt.getTime();
    return elapsed >= coolDownMs;
  }

  // Find the latest OTP sent to this email address
  const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (!latestOtp) return true;

  const elapsed = Date.now() - latestOtp.createdAt.getTime();
  return elapsed >= coolDownMs;
};

/**
 * Generates a new secure 6-digit OTP, invalidates any existing OTPs for the email,
 * and saves the new OTP to MongoDB (or fallback cache).
 * 
 * @param email The recipient email
 * @returns Promise<{ otp: string; expiresAt: Date }>
 */
export const generateOTP = async (email: string): Promise<{ otp: string; expiresAt: Date }> => {
  // Generate secure 6-digit OTP (e.g. 100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  if (!isDbConnected) {
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
  await OTP.deleteMany({ email });

  // Save new OTP record
  await OTP.create({
    email,
    otp,
    expiresAt,
    verified: false,
  });

  return { otp, expiresAt };
};

/**
 * Verifies a 6-digit OTP code against the database or fallback memory cache.
 * Marks the OTP as verified if valid and not expired.
 * 
 * @param email The recipient email
 * @param otpCode The 6-digit OTP code input
 * @returns Promise<{ success: boolean; message: string }> Verification status and description
 */
export const verifyOTP = async (email: string, otpCode: string): Promise<{ success: boolean; message: string }> => {
  if (!otpCode || otpCode.length !== 6) {
    return { success: false, message: 'OTP must be exactly 6 digits.' };
  }

  if (!isDbConnected) {
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
  const record = await OTP.findOne({ email, otp: otpCode, verified: false });

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

/**
 * Checks if the email verification step has been completed for registration.
 * 
 * @param email The target email
 * @returns Promise<boolean> True if verified, false otherwise
 */
export const isEmailVerified = async (email: string): Promise<boolean> => {
  if (!isDbConnected) {
    const record = fallbackOtps.get(email);
    return !!(record && record.verified);
  }

  const record = await OTP.findOne({ email, verified: true });
  return !!record;
};

/**
 * Clears the verified OTP record after successful registration.
 * 
 * @param email The verified email
 */
export const clearVerification = async (email: string): Promise<void> => {
  if (!isDbConnected) {
    fallbackOtps.delete(email);
    return;
  }
  await OTP.deleteMany({ email });
};
