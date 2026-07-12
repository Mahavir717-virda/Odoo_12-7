import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { auth } from '../../middleware/auth.js';

const router = Router();
const controller = new AuthController();

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', auth, controller.getMe);

export default router;
