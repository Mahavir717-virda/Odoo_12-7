import { Router } from 'express';
import { PolicyController } from './policy.controller.js';
import { upload } from '../../middleware/upload.js';
import {
  createPolicyValidation,
  updatePolicyValidation,
  getPolicyByIdValidation,
  acknowledgePolicyValidation,
  queryPoliciesValidation,
} from './policy.validation.js';

const router = Router();
const controller = new PolicyController();

router.get('/reports/summary', controller.getReportsSummary);
router.get('/acknowledgements', controller.getAcknowledgements);

router
  .route('/')
  .post(upload.single('document'), createPolicyValidation, controller.createPolicy)
  .get(queryPoliciesValidation, controller.getPolicies);

router
  .route('/:id')
  .get(getPolicyByIdValidation, controller.getPolicyById)
  .put(upload.single('document'), updatePolicyValidation, controller.updatePolicy);

router.post('/:id/acknowledge', acknowledgePolicyValidation, controller.acknowledgePolicy);

export default router;
