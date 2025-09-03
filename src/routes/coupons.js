import { Router } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth.js";
import {
  createCoupon,
  listCoupons,
  getCoupon,
  verifyCoupon,
  buyWithCredits,
  buyWithCash,
} from "../controllers/couponController.js";

const router = Router();

/**
 * Test route
 * GET /api/coupons/test
 */
router.get("/test", (req, res) => {
  res.json({ message: "Coupons API is working!" });
});

/**
 * List all coupons
 * GET /api/coupons
 */
router.get("/", listCoupons);

/**
 * Get single coupon by ID
 * GET /api/coupons/:id
 */
router.get("/:id", getCoupon);

/**
 * Create a new coupon
 * POST /api/coupons
 * Body: { brand, title, code, discount, expiry }
 */
router.post(
  "/",
  auth,
  [
    body("brand").notEmpty().withMessage("Brand is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("code").notEmpty().withMessage("Code is required"),
    body("discount").notEmpty().withMessage("Discount is required"),
    body("expiry").notEmpty().withMessage("Expiry date is required"),
  ],
  createCoupon
);

/**
 * Verify a coupon
 * POST /api/coupons/:id/verify
 */
router.post("/:id/verify", auth, verifyCoupon);

/**
 * Buy coupon with credits
 * POST /api/coupons/:id/buy/credits
 */
router.post("/:id/buy/credits", auth, buyWithCredits);

/**
 * Buy coupon with cash
 * POST /api/coupons/:id/buy/cash
 */
router.post("/:id/buy/cash", auth, buyWithCash);

export default router;
