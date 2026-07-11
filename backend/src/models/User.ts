import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'super-admin' | 'admin' | 'staff' | 'user';
  googleId?: string;
  wishlist: mongoose.Types.ObjectId[];
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  password: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'staff', 'user'], default: 'user' },
  googleId: { type: String },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
