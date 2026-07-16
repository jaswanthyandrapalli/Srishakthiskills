"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMailer = exports.isSmtpConfigured = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.isSmtpConfigured = Boolean(process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS);
const createMailer = () => {
    if (!exports.isSmtpConfigured) {
        return null;
    }
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};
exports.createMailer = createMailer;
