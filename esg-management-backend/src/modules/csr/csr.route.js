import { Router } from 'express';
import { CSRController } from './csr.controller.js';
import {
  createCSRValidation,
  updateCSRValidation,
  getCSRByIdValidation,
  queryCSRsValidation,
} from './csr.validation.js';

const router = Router();
const controller = new CSRController();

router
  .route('/')
  .post(createCSRValidation, controller.createCSR)
  .get(queryCSRsValidation, controller.getCSRs);

router
  .route('/:id')
  .get(getCSRByIdValidation, controller.getCSRById)
  .put(updateCSRValidation, controller.updateCSR)
  .delete(getCSRByIdValidation, controller.deleteCSR);

export default router;
