import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { requestSwap, mySwaps, respondSwap } from '../controllers/swapController.js';

const router = Router();

router.get('/', auth, mySwaps);
router.post('/', auth, [
  body('offeredCoupon').notEmpty(),
  body('requestedCoupon').notEmpty()
], requestSwap);

router.post('/:id/respond', auth, respondSwap);

export default router;
