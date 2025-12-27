// src/routes/adminRoutes.js
import { Router } from "express";
import adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

/**
 * Admin Routes
 * Handles access to the administration panel
 *
 * All routes are protected and require:
 * - an authenticated user
 * - administrative privileges
 */

// Admin dashboard (protected)
router.get(
  "/",
  requireAuth,
  requireAdmin,
  adminController.showAdminDashboard
);

export default router;
