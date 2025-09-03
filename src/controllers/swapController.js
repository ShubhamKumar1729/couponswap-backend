import { validationResult } from 'express-validator';
import Swap from '../models/Swap.js';
import Coupon from '../models/Coupon.js';

export const requestSwap = async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { offeredCoupon, requestedCoupon } = req.body;
  const reqC = await Coupon.findById(requestedCoupon);
  const offC = await Coupon.findById(offeredCoupon);
  if (!reqC || !offC) return res.status(404).json({ error: 'Coupon(s) not found' });
  if (offC.seller.toString() !== req.user.id) return res.status(403).json({ error: 'You do not own offered coupon' });

  const swap = await Swap.create({
    requester: req.user.id,
    responder: reqC.seller,
    offeredCoupon,
    requestedCoupon
  });
  res.status(201).json(swap);
};

export const mySwaps = async (req,res)=>{
  const uid = req.user.id;
  const swaps = await Swap.find({ $or: [{ requester: uid }, { responder: uid }] })
    .sort({ createdAt: -1 })
    .populate('offeredCoupon requestedCoupon', 'title brand')
    .populate('requester responder', 'name');
  res.json(swaps);
};

export const respondSwap = async (req,res)=>{
  const { decision } = req.body; // 'accepted' | 'rejected'
  const swap = await Swap.findById(req.params.id).populate('offeredCoupon requestedCoupon');
  if (!swap) return res.status(404).json({ error: 'Not found' });
  if (swap.responder.toString() !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

  swap.status = decision === 'accepted' ? 'accepted' : 'rejected';
  await swap.save();

  if (swap.status === 'accepted') {
    // Mark both coupons as sold (swapped)
    const a = await Coupon.findById(swap.offeredCoupon._id);
    const b = await Coupon.findById(swap.requestedCoupon._id);
    if (a && b) {
      a.sold = true; b.sold = true;
      await a.save(); await b.save();
    }
  }
  res.json(swap);
};
