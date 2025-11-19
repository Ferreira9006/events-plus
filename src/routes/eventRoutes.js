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

// Protected route — show event creation form
router.get("/create", requireAuth, eventController.showCreateEventForm);

// Show event details (public)
router.get("/:id", eventController.showEvent);

// List events created by the logged-in user
router.get("/mine", requireAuth, eventController.myEvents);

// Protected route — handle event creation
router.post("/create", requireAuth, eventController.createEvent);

// Handle participation in an event (requires login)
router.post("/:id/participate", requireAuth, eventController.participateInEvent);

export default router;
