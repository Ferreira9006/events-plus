// src/routes/event.routes.js
import { Router } from "express";
import eventController from "../controllers/eventController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Event Routes
 * Handles public listing, details, event creation and participation
 */

// Public route — show all events
router.get("/", eventController.listEvents);

export default router;
