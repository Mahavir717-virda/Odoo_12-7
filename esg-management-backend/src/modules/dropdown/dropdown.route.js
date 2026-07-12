import { Router } from 'express';
import { DropdownController } from './dropdown.controller.js';

const router = Router();
const controller = new DropdownController();

router.get('/departments', controller.getDepartments);
router.get('/categories', controller.getCategories);
router.get('/emission-factors', controller.getEmissionFactors);
router.get('/products', controller.getProducts);

export default router;
