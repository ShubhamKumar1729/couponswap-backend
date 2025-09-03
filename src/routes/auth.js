import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";

const router = Router();

/**
 * Test route
 * GET /api/auth/
 */
router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

/**
 * Register
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);

/**
 * Login
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

export default router;
