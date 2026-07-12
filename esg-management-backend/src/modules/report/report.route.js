import { Router } from 'express';
import { ReportController } from './report.controller.js';

const router = Router();
const controller = new ReportController();

// Basic Reports
router.get('/environment', controller.getEnvironmental);
router.get('/social', controller.getSocial);
router.get('/governance', controller.getGovernance);
router.get('/esg-summary', controller.getEsgSummary);
router.get('/challenges', controller.getChallenges);
router.get('/compliance', controller.getCompliance);
router.get('/policies', controller.getPolicies);
router.get('/audits', controller.getAudits);
router.get('/employees', controller.getEmployees);

// Custom & personal summaries
router.get('/modules', controller.getModules);
router.post('/custom', controller.getCustomReport);
router.get('/my-summary', controller.getMySummary);

// Report Types CRUD
router.get('/types', controller.getReportTypes);
router.post('/types', controller.createReportType);
router.put('/types/:id', controller.updateReportType);
router.delete('/types/:id', controller.deleteReportType);

// Templates CRUD
router.get('/template', controller.getTemplates);
router.post('/template', controller.createTemplate);
router.put('/template/:id', controller.updateTemplate);
router.delete('/template/:id', controller.deleteTemplate);

// Schedules CRUD
router.get('/schedule', controller.getSchedules);
router.post('/schedule', controller.createSchedule);
router.delete('/schedule/:id', controller.deleteSchedule);

// History CRUD
router.get('/history', controller.getHistory);
router.post('/history', controller.createHistory);

// Exports
router.post('/export/pdf', controller.exportPDF);
router.post('/export/excel', controller.exportExcel);
router.post('/export/csv', controller.exportCSV);

export default router;
