import { Router } from 'express';
import { RewardController } from './reward.controller.js';
import { createRewardValidation, redeemRewardValidation, getRedemptionByIdValidation } from './reward.validation.js';

const router = Router();
const controller = new RewardController();

router
  .route('/')
  .post(createRewardValidation, controller.createReward)
  .get(controller.listRewards);

router.post('/redeem', redeemRewardValidation, controller.redeemReward);
router.get('/my-redemptions', controller.getMyRedemptions);

router.get('/redemptions', controller.getAllRedemptions);
router.put('/redemptions/:id/approve', getRedemptionByIdValidation, controller.approveRedemption);
router.put('/redemptions/:id/reject', getRedemptionByIdValidation, controller.rejectRedemption);

export default router;
