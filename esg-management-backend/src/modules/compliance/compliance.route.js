import { Router } from 'express';
import { ComplianceController } from './compliance.controller.js';
import { upload } from '../../middleware/upload.js';
import {
  createComplianceValidation,
  getComplianceByIdValidation,
  assignComplianceValidation,
  progressUpdateValidation,
  verifyComplianceValidation,
  queryCompliancesValidation,
} from './compliance.validation.js';

const router = Router();
const controller = new ComplianceController();

router.get('/reports/summary', controller.getReportsSummary);

router
  .route('/')
  .post(createComplianceValidation, controller.createIssue)
  .get(queryCompliancesValidation, controller.listIssues);

router
  .route('/:id')
  .get(getComplianceByIdValidation, controller.getIssueById);

router.get('/:id/history', getComplianceByIdValidation, controller.getHistory);
router.put('/:id/assign', assignComplianceValidation, controller.assignIssue);
router.post('/:id/updates', upload.single('attachment'), progressUpdateValidation, controller.addProgressUpdate);
router.put('/:id/verify', verifyComplianceValidation, controller.verifyResolution);
router.put('/:id/resolve', getComplianceByIdValidation, controller.resolveIssue);

export default router;
