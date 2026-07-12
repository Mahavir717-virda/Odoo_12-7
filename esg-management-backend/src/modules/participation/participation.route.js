import { Router } from 'express';
import { ParticipationController } from './participation.controller.js';
import { upload } from '../../middleware/upload.js';
import {
  joinActivityValidation,
  approveParticipationValidation,
  rejectParticipationValidation,
  getParticipationByIdValidation,
  queryParticipationsValidation,
} from './participation.validation.js';

const router = Router();
const controller = new ParticipationController();

router
  .route('/')
  .get(queryParticipationsValidation, controller.getParticipations);

router
  .route('/join')
  .post(upload.single('proof'), joinActivityValidation, controller.joinActivity);

router
  .route('/:id')
  .get(getParticipationByIdValidation, controller.getParticipationById);

router
  .route('/:id/approve')
  .post(approveParticipationValidation, controller.approveParticipation);

router
  .route('/:id/reject')
  .post(rejectParticipationValidation, controller.rejectParticipation);

export default router;
