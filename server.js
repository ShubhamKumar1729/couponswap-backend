// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import cron from "node-cron";

// Import routes
import authRoutes from "./src/routes/auth.js";
import couponRoutes from "./src/routes/coupons.js";
import reviewRoutes from "./src/routes/reviews.js";
import swapRoutes from "./src/routes/swaps.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "*",
    credentials: true,
  })
);
app.use(morgan("dev"));

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/coupon_swap";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Root test route
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "coupon-swap-backend" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/swaps", swapRoutes);

// Import models for cron job
import Coupon from "./src/models/Coupon.js";
import User from "./src/models/User.js";

// Scheduled task: reminders for expiring coupons
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiring = await Coupon.find({
        expiry: { $lte: in7, $gte: now },
        sold: false,
      });

      for (const c of expiring) {
        const user = await User.findById(c.seller);
        if (user) {
          console.log(
            `[REMINDER] Email to ${user.email}: Your coupon "${c.title}" expires on ${c.expiry.toDateString()}.`
          );
        }
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  },
  { timezone: "Asia/Kolkata" }
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
