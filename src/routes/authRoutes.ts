import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  registerUser, 
  loginUser, 
  sendOTP, 
  verifyOTP, 
  resendOTP,
  googleLogin 
} from '../controllers/authController.js';

const router = express.Router();

// Rate limiter for OTP generation endpoints to prevent spam and resource abuse
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please wait 10 minutes before requesting another OTP code.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Primary auth endpoints requested
router.post('/send-otp', otpRateLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', otpRateLimiter, resendOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// Legacy routes preserved for backward compatibility
router.post('/otp-request', otpRateLimiter, sendOTP);
router.post('/otp-verify', verifyOTP);

export default router;
