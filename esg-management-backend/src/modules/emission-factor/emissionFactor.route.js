import { Router } from 'express';
import { EmissionFactorController } from './emissionFactor.controller.js';
import {
  createEmissionFactorValidation,
  updateEmissionFactorValidation,
  getEmissionFactorByIdValidation,
  queryEmissionFactorsValidation,
  preventMassAssignment,
} from './emissionFactor.validation.js';

const router = Router();
const controller = new EmissionFactorController();

router
  .route('/')
  .post(preventMassAssignment, createEmissionFactorValidation, controller.createEmissionFactor)
  .get(queryEmissionFactorsValidation, controller.getEmissionFactors);

router
  .route('/:id')
  .get(getEmissionFactorByIdValidation, controller.getEmissionFactorById)
  .patch(preventMassAssignment, updateEmissionFactorValidation, controller.updateEmissionFactor)
  .delete(getEmissionFactorByIdValidation, controller.deleteEmissionFactor);

export default router;
