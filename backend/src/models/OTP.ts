import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

const OTPSchema = new Schema<IOTP>({
  email: { 
    type: String, 
    required: true, 
    index: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  verified: { 
    type: Boolean, 
    default: false 
  }
});

// Configure TTL index on expiresAt.
// Mongoose / MongoDB will automatically delete documents after the expiresAt date/time is reached.
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
