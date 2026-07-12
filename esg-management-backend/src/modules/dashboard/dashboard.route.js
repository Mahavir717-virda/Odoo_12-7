import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();
const controller = new DashboardController();

router.get('/summary', controller.getSummary);
router.get('/compliance', controller.getCompliance);
router.get('/challenges', controller.getChallenges);
router.get('/badges', controller.getBadges);
router.get('/rewards', controller.getRewards);
router.get('/policies', controller.getPolicies);
router.get('/audits', controller.getAudits);
router.get('/employees', controller.getEmployees);
router.get('/charts', controller.getCharts);

export default router;
