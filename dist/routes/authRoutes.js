"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_js_1 = require("../controllers/authController.js");
const router = express_1.default.Router();
// Rate limiter for OTP generation endpoints to prevent spam and resource abuse
const otpRateLimiter = (0, express_rate_limit_1.default)({
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
router.post('/send-otp', otpRateLimiter, authController_js_1.sendOTP);
router.post('/verify-otp', authController_js_1.verifyOTP);
router.post('/resend-otp', otpRateLimiter, authController_js_1.resendOTP);
router.post('/register', authController_js_1.registerUser);
router.post('/login', authController_js_1.loginUser);
router.post('/google', authController_js_1.googleLogin);
// Legacy routes preserved for backward compatibility
router.post('/otp-request', otpRateLimiter, authController_js_1.sendOTP);
router.post('/otp-verify', authController_js_1.verifyOTP);
exports.default = router;
