import { Router } from 'express';
import { BadgeController } from './badge.controller.js';
import { createBadgeValidation, getBadgeProfileValidation } from './badge.validation.js';

const router = Router();
const controller = new BadgeController();

router
  .route('/')
  .post(createBadgeValidation, controller.createBadge)
  .get(controller.listBadges);

router.get('/profile', getBadgeProfileValidation, controller.getProfile);
router.get('/history', controller.getHistory);
router.post('/check', controller.checkBadges);

export default router;
