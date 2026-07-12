import { Router } from 'express';
import { DepartmentController } from './department.controller.js';
import {
  createDepartmentValidation,
  updateDepartmentValidation,
  getDepartmentByIdValidation,
  queryDepartmentsValidation,
} from './department.validation.js';

const router = Router();
const controller = new DepartmentController();

router
  .route('/')
  .post(createDepartmentValidation, controller.createDepartment)
  .get(queryDepartmentsValidation, controller.getDepartments);

router
  .route('/:id')
  .get(getDepartmentByIdValidation, controller.getDepartmentById)
  .patch(updateDepartmentValidation, controller.updateDepartment)
  .delete(getDepartmentByIdValidation, controller.deleteDepartment);

export default router;
