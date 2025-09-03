import mongoose from 'mongoose';

const SwapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredCoupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  requestedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  status: { type: String, enum: ['pending','accepted','rejected','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Swap', SwapSchema);
