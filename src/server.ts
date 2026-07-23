import './config/env.js'; // Must be the first import to initialize env variables!
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, isDbConnected } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Model imports (needed for seeding)
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (required for express-rate-limit behind Render)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for easy local development / integration
}));
const frontendUrl = process.env.FRONTEND_URL;
// Support multiple comma-separated origins (e.g. "https://app.vercel.app,https://custom-domain.com")
const allowedOrigins: string[] = [];
if (frontendUrl) {
  frontendUrl.split(',').forEach(url => {
    const trimmed = url.trim().replace(/\/$/, '');
    if (trimmed) allowedOrigins.push(trimmed);
  });
}
// Always allow localhost for development
if (!allowedOrigins.includes('http://localhost:3000')) {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads
app.use(morgan('dev'));

const createInitialSuperAdmin = async (): Promise<void> => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    console.warn('SUPER_ADMIN_EMAIL is not set. Skipping initial super admin creation.');
    return;
  }

  const existingUser = await User.findOne({ email: superAdminEmail });
  
  if (existingUser) {
    if (existingUser.role !== 'super-admin') {
      existingUser.role = 'super-admin';
      await existingUser.save();
      console.log(`Existing user ${superAdminEmail} promoted to Super Admin.`);
    }
    return;
  }

  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!superAdminPassword) {
    console.warn('SUPER_ADMIN_PASSWORD is not set. Skipping initial super admin creation.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(superAdminPassword, salt);

  try {
    await User.create({
      name: 'Krishna Kumari',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'super-admin',
    });
    console.log('Initial Super Admin account created successfully.');
  } catch (err: any) {
    if (err.code === 11000) {
      console.log('Initial Super Admin already exists (seeding duplicate write caught and ignored).');
    } else {
      console.error('Failed to create initial super admin:', err.message);
    }
  }
};

// Database connection
connectDB().then(async (connected) => {
  try {
    if (!connected || !isDbConnected) {
      console.log('Skipping database operations because MongoDB is unavailable.');
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Skipping initial database seeding of mock products and test accounts.');
      await createInitialSuperAdmin();
      return;
    }

    // Database Seeding Logic (Runs only if Products collection is empty in non-production)
    const productCount = await Product.countDocuments({});
    if (productCount === 0) {
      console.log('Seeding initial products, coupons, and test accounts...');

      // 1. Seed Products
      const seededProducts = await Product.insertMany([
        {
          name: 'Kanchipuram Pure Silk Bridal Saree',
          price: 12500,
          discount: 10,
          category: 'Bridal',
          images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Exquisite hand-woven pure Kanchipuram silk saree with rich zari border and traditional motifs. Ideal for grand weddings and brides seeking classic luxury.',
          fabric: 'Pure Mulberry Silk with Gold Zari',
          colors: ['Deep Maroon', 'Scarlet Red', 'Royal Gold'],
          stock: 8,
          ratings: 4.8,
          numReviews: 2
        },
        {
          name: 'Venkatagiri Fine Cotton Saree',
          price: 2499,
          discount: 5,
          category: 'Cotton',
          images: [
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Lightweight and highly breathable Venkatagiri cotton saree with fine weave and gold border, ideal for hot summer events, corporate wear, and daily elegance.',
          fabric: 'Venkatagiri Pure Cotton',
          colors: ['Off-White', 'Mint Green', 'Citrus Yellow'],
          stock: 15,
          ratings: 4.5,
          numReviews: 1
        },
        {
          name: 'Dharmavaram Double-Shaded Silk Saree',
          price: 8999,
          discount: 15,
          category: 'Silk',
          images: [
            'https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Traditional Dharmavaram silk saree featuring double-shaded body weaving and a grand contrasting pallu decorated with detailed temple borders.',
          fabric: 'Dharmavaram Silk',
          colors: ['Peacock Blue', 'Royal Pink'],
          stock: 10,
          ratings: 4.7,
          numReviews: 0
        },
        {
          name: 'Banarasi Soft Georgette Designer Saree',
          price: 6499,
          discount: 20,
          category: 'Designer',
          images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Banarasi georgette saree featuring intricate zari jaal work, flowing drape, and a designer contemporary border setup.',
          fabric: 'Premium Banarasi Georgette',
          colors: ['Crimson Red', 'Mustard Yellow', 'Forest Green'],
          stock: 12,
          ratings: 4.6,
          numReviews: 0
        },
        {
          name: 'Gadwal Pure Handloom Saree',
          price: 5200,
          discount: 10,
          category: 'Handloom',
          images: [
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Authentic Gadwal handloom saree with soft cotton body and pure silk border and pallu. Handcrafted by local weavers in Andhra Pradesh.',
          fabric: 'Gadwal Cotton-Silk Blend',
          colors: ['Emerald Green', 'Maroon Red'],
          stock: 3, // Low stock, triggers admin threshold alert
          ratings: 4.9,
          numReviews: 3
        },
        {
          name: 'Fancy Organza Party Wear Saree',
          price: 3500,
          discount: 8,
          category: 'Party Wear',
          images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Charming organza saree with beautiful floral embroidery work and delicate scallop borders. A modern designer style for evening parties.',
          fabric: 'Premium Organza',
          colors: ['Lavender Rose', 'Pastel Pink'],
          stock: 7,
          ratings: 4.4,
          numReviews: 1
        }
      ]);

      console.log('Seeded 6 gorgeous sarees.');

      // 2. Seed Coupons
      await Coupon.insertMany([
        {
          code: 'WELCOME500',
          discountType: 'fixed',
          discountValue: 500,
          minOrderValue: 3000,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        },
        {
          code: 'FESTIVE20',
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 5000,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        }
      ]);
      console.log('Seeded discount coupons.');

      // 3. Seed Users (1 Admin & 1 Customer)
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('AdminPassword123', salt);
      const userPassword = await bcrypt.hash('UserPassword123', salt);

      await User.create([
        {
          name: 'Sri Sakthi Admin',
          email: 'admin@srisakthi.com',
          password: adminPassword,
          role: 'admin',
        },
        {
          name: 'Telugu Couture Lover',
          email: 'user@srisakthi.com',
          password: userPassword,
          role: 'user',
        }
      ]);
      console.log('Seeded Admin (admin@srisakthi.com / AdminPassword123) and User (user@srisakthi.com / UserPassword123) accounts.');
    }

    await createInitialSuperAdmin();
  } catch (err: any) {
    console.error('Error seeding/seeding check:', err.message);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Sri Sakthi Sarees API server is running...');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
