"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.isDbConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.isDbConnected = false;
const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI;
        if (!connStr) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }
        // Mask password in the URI log to avoid exposing credentials in Render logs
        const maskedConnStr = connStr.replace(/:([^:@]+)@/, ':******@');
        console.log(`Connecting to MongoDB at: ${maskedConnStr}`);
        mongoose_1.default.set('strictQuery', true);
        await mongoose_1.default.connect(connStr);
        exports.isDbConnected = true;
        console.log(`MongoDB Connected successfully!`);
        return true;
    }
    catch (error) {
        exports.isDbConnected = false;
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (process.env.NODE_ENV === 'production') {
            throw error; // Fail fast in production
        }
        console.log('Backend will fallback to memory cache / mock mode where applicable.');
        return false;
    }
};
exports.connectDB = connectDB;
