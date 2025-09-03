import { validationResult } from "express-validator";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

// Create Coupon
export const createCoupon = async (req, res) => {
  console.log("📌 listCoupons called with query:", req.query);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const seller = req.user?.id || null; // handle if auth is missing
    const data = { ...req.body, seller };

    const coupon = await Coupon.create(data);

    // Reward credits
    if (seller) {
      await User.findByIdAndUpdate(seller, { $inc: { credits: 1 } });
    }

    res.status(201).json(coupon);
  } catch (error) {
    console.error("❌ Error creating coupon:", error);
    res.status(500).json({ error: "Server error while creating coupon" });
  }
};

// List Coupons
export const listCoupons = async (req, res) => {
  try {
    const { q, category } = req.query;
    const where = {};

    // Only filter sold=false if field exists
    where.sold = false;

    if (category && category !== "all") {
      where.category = category;
    }

    if (q) {
      where.$or = [
        { brand: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const coupons = await Coupon.find(where)
      .sort({ createdAt: -1 })
      .populate("seller", "name ratingAvg ratingCount");

    res.json(coupons);
  } catch (error) {
    console.error("❌ Error fetching coupons:", error);
    res.status(500).json({ error: "Server error while fetching coupons" });
  }
};

// Get single coupon
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "seller",
      "name ratingAvg ratingCount"
    );
    if (!coupon) return res.status(404).json({ error: "Not found" });
    res.json(coupon);
  } catch (error) {
    console.error("❌ Error fetching coupon:", error);
    res.status(500).json({ error: "Server error while fetching coupon" });
  }
};

// Verify coupon
export const verifyCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    res.json(coupon);
  } catch (error) {
    console.error("❌ Error verifying coupon:", error);
    res.status(500).json({ error: "Server error while verifying coupon" });
  }
};

// Buy with credits
export const buyWithCredits = async (req, res) => {
  try {
    const userId = req.user?.id;
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon || coupon.sold) {
      return res.status(400).json({ error: "Not available" });
    }

    const buyer = await User.findById(userId);
    if (!buyer || buyer.credits < 1) {
      return res.status(400).json({ error: "Not enough credits" });
    }

    await User.findByIdAndUpdate(buyer._id, { $inc: { credits: -1 } });
    await User.findByIdAndUpdate(coupon.seller, { $inc: { credits: 1 } });

    coupon.sold = true;
    await coupon.save();

    res.json({
      success: true,
      message: "Purchased with credits",
      couponId: coupon._id,
    });
  } catch (error) {
    console.error("❌ Error buying with credits:", error);
    res.status(500).json({ error: "Server error while buying with credits" });
  }
};

// Buy with cash
export const buyWithCash = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon || coupon.sold) {
      return res.status(400).json({ error: "Not available" });
    }

    coupon.sold = true;
    await coupon.save();

    res.json({
      success: true,
      message: "Purchased with cash (simulated)",
    });
  } catch (error) {
    console.error("❌ Error buying with cash:", error);
    res.status(500).json({ error: "Server error while buying with cash" });
  }
};

