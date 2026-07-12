import { Router } from 'express';
import { ProductESGProfileController } from './productESGProfile.controller.js';
import {
  createProfileValidation,
  updateProfileValidation,
  getProfileByIdValidation,
  queryProfilesValidation,
  preventMassAssignment,
} from './productESGProfile.validation.js';

const router = Router();
const controller = new ProductESGProfileController();

router
  .route('/')
  .post(preventMassAssignment, createProfileValidation, controller.createProfile)
  .get(queryProfilesValidation, controller.getProfiles);

router
  .route('/:id')
  .get(getProfileByIdValidation, controller.getProfileById)
  .patch(preventMassAssignment, updateProfileValidation, controller.updateProfile)
  .delete(getProfileByIdValidation, controller.deleteProfile);

export default router;
