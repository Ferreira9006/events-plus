import { Router } from "express";
import adminLocationsController from "../controllers/admin/adminLocationsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from '../middleware/requireAdmin.js';


const router = Router();

// Admin Location Routes
router.get("/", requireAuth, requireAdmin, adminLocationsController.index);
router.get("/create", requireAuth, requireAdmin, adminLocationsController.showCreateForm);
router.post("/create", requireAuth, requireAdmin, adminLocationsController.create);
router.get("/:id", requireAuth, requireAdmin, adminLocationsController.show);
router.get("/:id/edit", requireAuth, requireAdmin, adminLocationsController.showEditForm);
router.post("/:id", requireAuth, requireAdmin, adminLocationsController.update);
router.post("/:id/delete", requireAuth, requireAdmin, adminLocationsController.remove);

export default router;