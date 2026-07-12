import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { upload } from '../../middleware/upload.js';
import {
  scheduleAuditValidation,
  addFindingValidation,
  assignCorrectiveActionValidation,
  getAuditByIdValidation,
  resolveCorrectiveActionValidation,
  verifyCorrectiveActionValidation,
} from './audit.validation.js';

const router = Router();
const controller = new AuditController();

router.get('/reports/summary', controller.getReportsSummary);

router
  .route('/')
  .post(scheduleAuditValidation, controller.scheduleAudit)
  .get(controller.listAudits);

router
  .route('/:id')
  .get(getAuditByIdValidation, controller.getAuditById);

router
  .route('/:id/findings')
  .post(upload.single('evidence'), addFindingValidation, controller.addFinding)
  .get(getAuditByIdValidation, controller.getFindings);

router.post('/corrective-actions', assignCorrectiveActionValidation, controller.assignAction);
router.put('/corrective-actions/:id/resolve', resolveCorrectiveActionValidation, controller.resolveAction);
router.put('/corrective-actions/:id/verify', verifyCorrectiveActionValidation, controller.verifyAction);

export default router;
