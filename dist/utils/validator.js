"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.validateEmail = void 0;
/**
 * Validates whether the given string is a valid email format.
 *
 * @param email Email input string
 * @returns boolean
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
/**
 * Validates whether the password meets security requirements (min 8 characters).
 *
 * @param password Password input string
 * @returns boolean
 */
const validatePassword = (password) => {
    return typeof password === 'string' && password.length >= 8;
};
exports.validatePassword = validatePassword;
