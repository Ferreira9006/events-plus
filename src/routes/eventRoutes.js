// src/routes/event.routes.js
import { Router } from "express";
import eventController from "../controllers/eventController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireEventOwner } from "../middleware/requireEventOwner.js";

const router = Router();

/**
 * Event Routes
 * Handles public listing, details, event creation and participation
 */

// Public route — show all events
router.get("/", eventController.listEvents);

// Protected route — show event creation form
router.get("/create", requireAuth, eventController.showCreateEventForm);

// List events created by the logged-in user
router.get("/mine", requireAuth, eventController.myEvents);

// Show event details (public)
router.get("/:id", eventController.showEvent);

// Protected route — handle event creation
router.post("/create", requireAuth, eventController.createEvent);

// Handle participation in an event (requires login)
router.post("/:id/participate", requireAuth, eventController.participateInEvent);

// Handle leaving an event (requires login)
router.post("/:id/leave", requireAuth, eventController.leaveEvent);

// Protected routes for editing and deleting events (only by owner)
router.get("/:id/edit", requireAuth, requireEventOwner, eventController.showUpdateEventForm);

// Handle event update
router.post("/:id/edit", requireAuth, requireEventOwner, eventController.updateEvent);

// Handle event deletion
router.post("/:id/delete", requireAuth, requireEventOwner, eventController.deleteEvent);


export default router;
