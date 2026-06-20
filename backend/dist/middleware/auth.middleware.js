"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        // Get token from HTTP-only cookie
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: 'Not authorized. Please log in.' });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'JWT secret not configured' });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Fetch user (exclude password)
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ message: 'User not found. Token invalid.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token invalid or expired. Please log in again.' });
    }
};
exports.protect = protect;
