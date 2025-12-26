import { Router } from "express";
import adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from '../middleware/requireAdmin.js';


const router = Router();

// Admin Routes
router.get("/", requireAuth, requireAdmin, adminController.showAdminDashboard);


export default router;