import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryByIdValidation,
  queryCategoriesValidation,
  preventMassAssignment,
} from './category.validation.js';

const router = Router();
const controller = new CategoryController();

router
  .route('/')
  .post(preventMassAssignment, createCategoryValidation, controller.createCategory)
  .get(queryCategoriesValidation, controller.getCategories);

router
  .route('/:id')
  .get(getCategoryByIdValidation, controller.getCategoryById)
  .patch(preventMassAssignment, updateCategoryValidation, controller.updateCategory)
  .delete(getCategoryByIdValidation, controller.deleteCategory);

export default router;
