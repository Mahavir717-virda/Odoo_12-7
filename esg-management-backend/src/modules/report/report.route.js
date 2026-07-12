import { Router } from 'express';
import { ReportController } from './report.controller.js';

const router = Router();
const controller = new ReportController();

router.get('/environment', controller.getEnvironmental);
router.get('/social', controller.getSocial);
router.get('/governance', controller.getGovernance);
router.get('/esg-summary', controller.getEsgSummary);
router.get('/challenges', controller.getChallenges);
router.get('/compliance', controller.getCompliance);
router.get('/policies', controller.getPolicies);
router.get('/audits', controller.getAudits);
router.get('/employees', controller.getEmployees);

router.post('/export/pdf', controller.exportPDF);
router.post('/export/excel', controller.exportExcel);
router.post('/export/csv', controller.exportCSV);

export default router;
