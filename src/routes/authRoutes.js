import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

// Auth Routes
router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);

router.post('/login', authController.login);
router.post('/register', authController.register);

export default router;