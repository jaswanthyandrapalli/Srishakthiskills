import mongoose from 'mongoose';

export let isDbConnected = false;

export const connectDB = async (): Promise<boolean> => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in the environment variables.');
    }
    
    // Mask password in the URI log to avoid exposing credentials in Render logs
    const maskedConnStr = connStr.replace(/:([^:@]+)@/, ':******@');
    console.log(`Connecting to MongoDB at: ${maskedConnStr}`);
    
    mongoose.set('strictQuery', true);
    await mongoose.connect(connStr);
    isDbConnected = true;
    console.log(`MongoDB Connected successfully!`);
    return true;
  } catch (error: any) {
    isDbConnected = false;
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail fast in production
    }
    console.log('Backend will fallback to memory cache / mock mode where applicable.');
    return false;
  }
};
