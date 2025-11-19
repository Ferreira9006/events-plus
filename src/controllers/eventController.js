import Event from "../models/event.model.js";

/*
  Event Controller
  Handles listing all events
*/
export async function listEvents(req, res) {
  try {
    const events = await Event.find().populate("organizer", "name email");

    res.render("events/index", { title: "Eventos", events, user: req.session.user });
  } catch (error) {
    console.error("Error listing events:", error);
    res.status(500).send("Internal server error");
  }
}

/*
  Renders the event creation form
*/
export function showCreateEventForm(req, res) {
  res.render("events/create", { title: "Create Event", user: req.session.user });
}


/* 
  Creates the event to the database
*/
export async function createEvent(req, res) {
  try {
    const { title, description, date, time, location, capacity } = req.body;
    const organizerId = req.session.user._id;

    if (!title || !date || !location || !description || !capacity) {
      res.render("events/create", { error: "All fields are required" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      capacity,
      organizer: organizerId,
      status: "OPEN"
    });

    await newEvent.save();
    res.redirect("/events");

  } catch (error) {
    console.error("Error creating event:", error);
    res.render("events/create", { message: "Internal server error" });
  }
}

/**
 * List events created by the currently logged-in user
 * Renders the events/mine view with user's events
 */
export async function myEvents(req, res) {
  try {
    const userId = req.session.user._id;

    const events = await Event.find({ organizer: userId });

    res.render("events/mine", { title: "Os meus eventos", events, user: req.session.user });
  } catch (error) {
    console.error("Error listing user events:", error);
    res.render("events/mine", { title: "Os meus eventos", events: [], user: req.session.user, error: "Internal server error" });
  }
}

/**
 * Show event details page
 * Renders the events/details view with event information
 */
export async function showEvent(req, res) {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId).populate("organizer", "name email").populate("participants", "name email");

    if (!event) return res.render("events/details", { title: "Event Details", user: req.session.user, error: "Event not found" });

    res.render("events/details", { title: "Event Details", event, user: req.session.user });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.render("events/details", { title: "Event Details", user: req.session.user, error: "Internal server error" });
  }
}

/**
 * Handle participation in an event
 * Adds the current user to the event's participants list
 * Checks status, capicity and if user is already a participant
 */
export async function participateInEvent(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.session.user.id;

    const event = await Event.findById(eventId).populate("participants", "_id");

    // Checks if the event exists
    if (!event) res.render("events/details", { title: "Event Details", user: req.session.user, error: "Event not found" });

    // Checks if the event is open
    if (event.status !== "OPEN") res.render("events/details", { title: "Event Details", user: req.session.user, error: "Event is not open for participation" });

    // Checks if the user is already a participant
    if (event.participants.includes(userId)) res.render("events/details", { title: "Event Details", user: req.session.user, error: "You are already participating in this event" });

    // Checks if the event has reached its capacity
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
      await event.save();
      return res.render("events/details", { title: "Event Details", user: req.session.user, error: "Event has reached its capacity" });
    }
    
    // Adds the user to the participants list
    event.participants.push(userId);

    // If after adding this participant we hit the capacity, mark event as full.
    if (event.participants.length >= event.capacity) event.status = "FULL";

    await event.save();

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Error participating in event:", error);
    res.render("events/details", { title: "Event Details", user: req.session.user, error: "Internal server error" });
  }
}

export default { listEvents, showCreateEventForm, createEvent, showEvent, myEvents, participateInEvent };
