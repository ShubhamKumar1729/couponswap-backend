import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

export const addReview = async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { coupon: couponId, rating, comment } = req.body;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

  const review = await Review.create({
    coupon: couponId,
    reviewer: req.user.id,
    seller: coupon.seller,
    rating,
    comment
  });

  // update coupon rating
  const all = await Review.find({ coupon: couponId });
  const avg = all.reduce((a,b)=>a+b.rating,0)/all.length;
  await Coupon.findByIdAndUpdate(couponId, { ratingAvg: avg, ratingCount: all.length });

  // update seller rating
  const sellerReviews = await Review.find({ seller: coupon.seller });
  const sAvg = sellerReviews.reduce((a,b)=>a+b.rating,0)/sellerReviews.length;
  await User.findByIdAndUpdate(coupon.seller, { ratingAvg: sAvg, ratingCount: sellerReviews.length });

  res.status(201).json(review);
};

export const listReviews = async (req,res)=>{
  const { couponId } = req.query;
  const where = {};
  if (couponId) where.coupon = couponId;
  const reviews = await Review.find(where).sort({ createdAt: -1 }).populate('reviewer','name').populate('coupon','title');
  res.json(reviews);
};
