import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  discount: number; // percentage
  category: 'Silk' | 'Cotton' | 'Bridal' | 'Designer' | 'Party Wear' | 'Handloom';
  images: string[];
  description: string;
  fabric: string;
  colors: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  isActive: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Silk', 'Cotton', 'Bridal', 'Designer', 'Party Wear', 'Handloom'] 
  },
  images: { type: [String], required: true },
  description: { type: String, required: true },
  fabric: { type: String, required: true },
  colors: { type: [String], required: true },
  stock: { type: Number, required: true, default: 0 },
  ratings: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
