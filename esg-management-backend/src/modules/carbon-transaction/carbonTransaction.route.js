import { Router } from 'express';
import { CarbonTransactionController } from './carbonTransaction.controller.js';
import {
  createTransactionValidation,
  updateTransactionValidation,
  getTransactionByIdValidation,
  queryTransactionsValidation,
  queryAggregationsValidation,
  preventMassAssignment,
} from './carbonTransaction.validation.js';

const router = Router();
const controller = new CarbonTransactionController();

// Analytical aggregates must be declared BEFORE parameterized routes to prevent matching /:id
router.get('/statistics', queryAggregationsValidation, controller.getStatistics);
router.get('/dashboard', queryAggregationsValidation, controller.getDashboard);

router
  .route('/')
  .post(preventMassAssignment, createTransactionValidation, controller.createTransaction)
  .get(queryTransactionsValidation, controller.getTransactions);

router
  .route('/:id')
  .get(getTransactionByIdValidation, controller.getTransactionById)
  .patch(preventMassAssignment, updateTransactionValidation, controller.updateTransaction)
  .delete(getTransactionByIdValidation, controller.deleteTransaction);

export default router;
