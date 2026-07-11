import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  actionType: 'login' | 'logout' | 'product_added' | 'product_updated' | 'product_deleted' | 'order_updated' | 'coupon_created' | 'settings_changed';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  adminName: { type: String, required: true },
  actionType: { 
    type: String, 
    required: true, 
    enum: ['login', 'logout', 'product_added', 'product_updated', 'product_deleted', 'order_updated', 'coupon_created', 'settings_changed'] 
  },
  description: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
