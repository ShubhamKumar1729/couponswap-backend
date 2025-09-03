import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  discount: { type: String, required: true },
  price: { type: Number, default: 0 }, // for buy/sell
  category: { type: String, enum: ['fashion','electronics','food','travel','beauty','home','other'], default: 'other' },
  description: { type: String, default: '' },
  expiry: { type: Date, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verified: { type: Boolean, default: false },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  sold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Coupon', CouponSchema);
