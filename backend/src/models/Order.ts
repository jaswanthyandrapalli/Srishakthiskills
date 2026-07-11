import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  paymentResult?: {
    id: string;
    status: string;
    email?: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  discountAmount: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  trackingCarrier?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['UPI', 'Card', 'NetBanking', 'COD'] 
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    email: { type: String },
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  discountAmount: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  orderStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending' 
  },
  trackingNumber: { type: String },
  trackingCarrier: { type: String, default: 'Delhivery' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
