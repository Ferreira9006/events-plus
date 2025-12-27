import { Router } from "express";
import adminLocationsController from "../controllers/admin/adminLocationsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from '../middleware/requireAdmin.js';


const router = Router();

// Admin Location Routes
router.get("/", requireAuth, requireAdmin, adminLocationsController.index);

router.get("/:id", requireAuth, requireAdmin, adminLocationsController.show);

export default router;