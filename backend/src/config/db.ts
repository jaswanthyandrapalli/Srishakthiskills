import mongoose from 'mongoose';

export let isDbConnected = false;

export const connectDB = async (): Promise<boolean> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srisakthi';
    console.log(`Connecting to MongoDB at: ${connStr}`);
    
    // We will attempt connection, but if it fails we log a warning and let the backend run
    // in mock mode rather than crashing. This ensures the app is 100% testable.
    mongoose.set('strictQuery', true);
    await mongoose.connect(connStr);
    isDbConnected = true;
    console.log(`MongoDB Connected successfully!`);
    return true;
  } catch (error: any) {
    isDbConnected = false;
    console.error(`MongoDB Connection Warning: ${error.message}`);
    console.log('Backend will fallback to memory cache / mock mode where applicable.');
    return false;
  }
};
