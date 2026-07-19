import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { authFallbackUsers } from '../controllers/authController.js';

// Extend Express Request type to include user details
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
      }
      const decoded: any = jwt.verify(token, jwtSecret);
      
      if (!isDbConnected) {
        const email = decoded.id;
        const fallbackUser = authFallbackUsers.get(email);
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

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }
      
      // Ensure req.user.id is explicitly set
      req.user.id = req.user._id.toString();
      
      next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'super-admin' || req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, access denied.' });
  }
};
