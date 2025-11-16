import { Router } from "express";
import eventController from "../controllers/eventController.js";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Auth Routes
router.get('/', requireAuth, eventController.listEvents);

export default router;