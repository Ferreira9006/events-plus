import { Router } from "express";
import authController from "../controllers/authController.js";
import { requireAuth, redirectIfAuth } from '../middleware/auth.js';

const router = Router();

// Auth Routes
router.get('/login', redirectIfAuth, authController.showLogin);
router.get('/register', redirectIfAuth, authController.showRegister);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', requireAuth, authController.logout);

export default router;