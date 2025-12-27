// src/routes/authRoutes.js
import { Router } from "express";
import authController from "../controllers/authController.js";
import { requireAuth, redirectIfAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Authentication Routes
 * Handles user login, registration and logout
 */

// Public routes — authentication forms (only for guests)
router.get("/login", redirectIfAuth, authController.showLogin);
router.get("/register", redirectIfAuth, authController.showRegister);

// Public routes — authentication actions
router.post("/login", authController.login);
router.post("/register", authController.register);

// Protected route — logout (requires active session)
router.get("/logout", requireAuth, authController.logout);

export default router;
