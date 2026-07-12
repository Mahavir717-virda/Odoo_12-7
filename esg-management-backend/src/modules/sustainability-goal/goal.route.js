import { Router } from 'express';
import { GoalController } from './goal.controller.js';
import {
  createGoalValidation,
  updateGoalValidation,
  getGoalByIdValidation,
  queryGoalsValidation,
  queryGoalStatsValidation,
  preventMassAssignment,
} from './goal.validation.js';

const router = Router();
const controller = new GoalController();

// Aggregation paths (Declared BEFORE parameterized paths to avoid regex mapping overrides)
router.get('/statistics', queryGoalStatsValidation, controller.getStatistics);
router.get('/dashboard', queryGoalStatsValidation, controller.getDashboard);
router.post('/recalculate', controller.recalculateGoals);

router
  .route('/')
  .post(preventMassAssignment, createGoalValidation, controller.createGoal)
  .get(queryGoalsValidation, controller.getGoals);

router
  .route('/:id')
  .get(getGoalByIdValidation, controller.getGoalById)
  .patch(preventMassAssignment, updateGoalValidation, controller.updateGoal)
  .delete(getGoalByIdValidation, controller.deleteGoal);

export default router;
