// src/middleware/requireEventOwner.js

import Event from "../models/event.model.js";

/**
 * Event Ownership Middleware
 *
 * Ensures that the logged-in user is the organizer (owner) of a given event.
 * This middleware is typically used to protect edit, update and delete actions.
 */

/**
 * Verify if the authenticated user is the owner of the event.
 *
 * - Fetches the event by ID from the route parameter
 * - Returns an error view if the event does not exist
 * - Prevents access if the user is not the event organizer
 * - Attaches the event to the request object to avoid refetching
 *
 * Usage:
 *   router.get("/events/:id/edit", requireAuth, requireEventOwner, controllerAction);
 */
export async function requireEventOwner(req, res, next) {
  const userId = req.session.user.id;
  const eventId = req.params.id;

  // Fetch event from database
  const event = await Event.findById(eventId);

  if (!event) {
    return res.render("events/show", {
      title: "Evento",
      error: "Evento não encontrado.",
    });
  }

  // Check if the logged-in user is the event organizer
  if (event.organizer.toString() !== userId) {
    return res.render("events/show", {
      title: event.title,
      event,
      error: "Não tens permissão para executar esta ação.",
    });
  }

  // Attach event to request to avoid refetching in controllers
  req.event = event;
  next();
}
