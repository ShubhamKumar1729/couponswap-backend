import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { addReview, listReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/', listReviews);
router.post('/', auth, [
  body('coupon').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 })
], addReview);

export default router;
