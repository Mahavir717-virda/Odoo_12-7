import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import departmentRouter from '../modules/department/department.route.js';
import categoryRouter from '../modules/category/category.route.js';
import emissionFactorRouter from '../modules/emission-factor/emissionFactor.route.js';
import productESGProfileRouter from '../modules/product-esg-profile/productESGProfile.route.js';
import carbonTransactionRouter from '../modules/carbon-transaction/carbonTransaction.route.js';
import dropdownRouter from '../modules/dropdown/dropdown.route.js';
import csrRouter from '../modules/csr/csr.route.js';
import participationRouter from '../modules/participation/participation.route.js';
import goalRouter from '../modules/sustainability-goal/goal.route.js';
import challengeRouter from '../modules/challenge/challenge.route.js';
import badgeRouter from '../modules/badge/badge.route.js';
import rewardRouter from '../modules/reward/reward.route.js';
import policyRouter from '../modules/policy/policy.route.js';
import auditRouter from '../modules/audit/audit.route.js';

const router = Router();

// Mount modules
router.use('/departments', departmentRouter);
router.use('/categories', categoryRouter);
router.use('/emission-factors', emissionFactorRouter);
router.use('/product-esg-profiles', productESGProfileRouter);
router.use('/carbon-transactions', carbonTransactionRouter);
router.use('/dropdowns', dropdownRouter);
router.use('/csr', csrRouter);
router.use('/participations', participationRouter);
router.use('/challenges', challengeRouter);
router.use('/sustainability-goals', goalRouter);
router.use('/badges', badgeRouter);
router.use('/rewards', rewardRouter);
router.use('/policies', policyRouter);
router.use('/audits', auditRouter);

/**
 * GET /api/v1
 * Root API Entrypoint
 */
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'ESG Backend API Running',
  });
});

/**
 * GET /api/v1/health
 * Health check endpoint showing system metrics, DB connectivity status, and server uptime.
 */
router.get('/health', (req, res) => {
  // Mongoose connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  let databaseStatus = 'Disconnected';
  
  if (dbState === 1) {
    databaseStatus = 'Connected';
  } else if (dbState === 2) {
    databaseStatus = 'Connecting';
  } else if (dbState === 3) {
    databaseStatus = 'Disconnecting';
  }

  const uptimeSeconds = process.uptime();
  const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`;

  res.status(HTTP_STATUS.OK).json({
    status: 'OK',
    database: databaseStatus,
    uptime,
  });
});

export default router;
