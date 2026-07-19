"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = __importDefault(require("../models/User.js"));
const db_js_1 = require("../config/db.js");
const authController_js_1 = require("../controllers/authController.js");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET is not defined in environment variables.');
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (!db_js_1.isDbConnected) {
                const email = decoded.id;
                const fallbackUser = authController_js_1.authFallbackUsers.get(email);
                if (fallbackUser) {
                    req.user = {
                        _id: fallbackUser._id,
                        id: fallbackUser._id,
                        name: fallbackUser.name,
                        email: fallbackUser.email,
                        phone: fallbackUser.phone,
                        role: fallbackUser.role,
                    };
                    next();
                    return;
                }
                // If not in the map, reconstruct dynamically
                const name = email.split('@')[0];
                const role = email === 'admin@srisakthi.com' ? 'super-admin' : 'user';
                req.user = {
                    _id: `fallback-${email}`,
                    id: `fallback-${email}`,
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    email: email,
                    role: role,
                };
                next();
                return;
            }
            req.user = await User_js_1.default.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }
            // Ensure req.user.id is explicitly set
            req.user.id = req.user._id.toString();
            next();
        }
        catch (error) {
            console.error('JWT Token Verification Error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'super-admin' || req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized, access denied.' });
    }
};
exports.admin = admin;
