// src/routes/adminLocationRoutes.js
import { Router } from "express";
import adminLocationsController from "../controllers/admin/adminLocationsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

/**
 * Admin Location Routes
 * Handles CRUD operations for locations in the admin panel
 *
 * All routes are protected and require:
 * - an authenticated user
 * - administrative privileges
 */

// List all locations
router.get(
  "/",
  requireAuth,
  requireAdmin,
  adminLocationsController.index
);

// Render location creation form
router.get(
  "/create",
  requireAuth,
  requireAdmin,
  adminLocationsController.showCreateForm
);

// Handle location creation
router.post(
  "/create",
  requireAuth,
  requireAdmin,
  adminLocationsController.create
);

// Show location details
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  adminLocationsController.show
);

// Render location edit form
router.get(
  "/:id/edit",
  requireAuth,
  requireAdmin,
  adminLocationsController.showEditForm
);

// Handle location update
router.post(
  "/:id",
  requireAuth,
  requireAdmin,
  adminLocationsController.update
);

// Handle location deletion
router.post(
  "/:id/delete",
  requireAuth,
  requireAdmin,
  adminLocationsController.remove
);

export default router;
