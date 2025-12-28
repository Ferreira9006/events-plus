// src/routes/adminUsersRoutes.js
import { Router } from "express";
import adminUsersController from "../controllers/admin/adminUsersController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

/**
 * Admin User Routes
 * Handles user management in the admin panel
 *
 * All routes require admin privileges.
 */

// List all users
router.get("/", requireAuth, requireAdmin, adminUsersController.index);

// Show user details
router.get("/:id", requireAuth, requireAdmin, adminUsersController.show);

// Render edit user form
router.get("/:id/edit", requireAuth, requireAdmin, adminUsersController.showEditForm);

// Handle user update
router.post("/:id", requireAuth, requireAdmin, adminUsersController.update);

// Handle user deletion
router.post("/:id/delete", requireAuth, requireAdmin, adminUsersController.remove);

export default router;
