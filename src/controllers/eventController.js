// src/controllers/eventController.js

import Event from "../models/event.model.js";
import Location from "../models/location.model.js";

/**
 * List all public events.
 * Renders the main events listing page.
 *
 * - Events are ordered by date, time and creation date
 * - Organizer and participants are populated for display
 * - Adds an `isParticipant` flag per event for UI logic
 */
export async function listEvents(req, res) {
  try {
    const events = await Event.find()
      .populate("location")
      .populate("organizer", "name email")
      .populate("participants", "name email")
      .sort({ date: 1, time: 1, createdAt: -1 });

    // Determine if the logged-in user is a participant in each event
    const eventsWithParticipation = events.map((event) => {
      const isParticipant = req.session.user
        ? event.participants.some((p) => p.id === req.session.user.id)
        : false;

      return { ...event.toObject(), isParticipant };
    });

    return res.render("events/index", {
      title: "Eventos",
      events: eventsWithParticipation,
    });

  } catch (error) {
    console.error("Error listing events:", error);
    req.flash("error", "Ocorreu um erro ao carregar os eventos.");
    return res.redirect("/");
  }
}

/**
 * Render the event creation form.
 * Route must be protected with `requireAuth`.
 */
export function showCreateEventForm(req, res) {
  return res.render("events/create", {
    title: "Criar evento",
    formData: {},
  });
}

/**
 * Create a new event.
 *
 * - Validates required fields
 * - Resolves or creates a Location based on latitude/longitude
 * - Stores only the Location reference in the Event
 * - Uses flash messages and redirect for UX consistency
 *
 * Route must be protected with `requireAuth`.
 */
export async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      locationLat,
      locationLon
    } = req.body;

    const userId = req.session.user.id;

    // Basic validation of required fields
    if (!title || !description || !date || !time || !location || !capacity) {
      req.flash("error", "Por favor, preenche todos os campos obrigatórios.");
      return res.redirect("/events/create");
    }

    // Attempt to find an existing location by coordinates
    let checkLocation = await Location.findOne({
      latitude: locationLat,
      longitude: locationLon,
    });

    // Create a new location if none exists
    if (!checkLocation) {
      checkLocation = await Location.create({
        name: location,
        address: location,
        latitude: locationLat,
        longitude: locationLon,
        source: "OSM",
      });
    }

    // Create the event with a reference to the Location
    await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      location: checkLocation._id,
      capacity,
      organizer: userId,
      status: "OPEN",
    });

    req.flash("success", "Evento criado com sucesso.");
    return res.redirect("/events");

  } catch (error) {
    console.error("Error creating event:", error);
    req.flash("error", "Ocorreu um erro ao criar o evento. Tenta novamente.");
    return res.redirect("/events/create");
  }
}

/**
 * List events created by the logged-in user.
 * Route must be protected with `requireAuth`.
 */
export async function myEvents(req, res) {
  try {
    const userId = req.session.user.id;

    const events = await Event.find({ organizer: userId })
    .populate("location")
    .populate("participants")
    .sort({ date: 1, time: 1, createdAt: -1, });

    return res.render("events/mine", {
      title: "Os meus eventos",
      events,
    });

  } catch (error) {
    console.error("Error listing user events:", error);

    req.flash("error", "Ocorreu um erro ao carregar os teus eventos.");
    
    return res.status(500).render("events/mine", {
      title: "Os meus eventos",
      events: [],
    });
  }
}

/**
 * Show details of a single event (public view).
 *
 * - Populates organizer and participants
 * - Determines if the user is a participant or the owner
 */
export async function showEvent(req, res) {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("organizer", "name email")
      .populate("participants", "name email");

    if (!event) {
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    // Check participation and ownership status
    const isParticipant = req.session.user
      ? event.participants.some(p => p.id === req.session.user.id)
      : false;

    const isOwner = req.session.user
      ? event.organizer.id === req.session.user.id
      : false;

    return res.render("events/show", {
      title: event.title,
      event,
      isParticipant,
      isOwner,
    });

  } catch (error) {
    console.error("Error fetching event details:", error);
    req.flash("error", "Ocorreu um erro ao carregar este evento.");
    return res.redirect("/events");
  }
}

/**
 * Add the logged-in user as a participant in an event.
 *
 * - Checks event status and capacity
 * - Prevents duplicate registrations
 * - Automatically updates event status when full
 *
 * Route must be protected with `requireAuth`.
 */
export async function participateInEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;

    const event = await Event.findById(eventId)
      .populate("participants", "id name email");

    if (!event) {
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    // Event must be open for participation
    if (event.status !== "OPEN") {
      req.flash("error", "Este evento não está aberto a novas inscrições.");
      return res.redirect("/events");
    }

    // Prevent duplicate participation
    const alreadyParticipant = event.participants.some(
      (p) => p.id === userId
    );

    if (alreadyParticipant) {
      req.flash("error", "Já estás inscrito neste evento.");
      return res.redirect(`/events/${event._id}`);
    }

    // Check capacity before adding participant
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
      await event.save();

      req.flash("error", "Este evento já atingiu a lotação máxima.");
      return res.redirect(`/events/${event._id}`);
    }

    // Add participant
    event.participants.push(userId);

    // Update status if capacity is reached
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
    }

    await event.save();

    req.flash("success", "Inscrição realizada com sucesso.");
    return res.redirect(`/events`);

  } catch (error) {
    console.error("Error participating in event:", error);
    req.flash("error", "Ocorreu um erro ao processar a tua participação.");
    return res.redirect(`/events/${req.params.id}`);
  }
}

/**
 * Remove the logged-in user from an event's participants.
 *
 * - Reopens the event if it was previously full
 *
 * Route must be protected with `requireAuth`.
 */
export async function leaveEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    // Remove user from participants list
    event.participants = event.participants.filter(
      p => p.toString() !== userId
    );

    // Reopen event if capacity is no longer full
    if (event.status === "FULL") {
      event.status = "OPEN";
    }

    await event.save();

    req.flash("success", "Inscrição removida com sucesso.");
    res.redirect(`/events`);

  } catch (error) {
    console.log("Error leaving event:", error);
    req.flash("error", "Ocorreu um erro ao remover a tua inscrição.");
    res.redirect(`/events`);
  }
}

/**
 * Render the event edit form.
 *
 * - Populates the Location reference
 * - Formats the date for HTML input compatibility (YYYY-MM-DD)
 */
export async function showUpdateEventForm(req, res) {
  const event = await req.event.populate("location");

  const formattedDate = event.date
    ? event.date.toISOString().split("T")[0]
    : "";

  res.render("events/edit", {
    title: "Editar evento",
    event: {
      ...event.toObject(),
      date: formattedDate,
    },
  });
}

/**
 * Update an existing event.
 *
 * - Updates basic event fields
 * - Resolves or creates a Location based on coordinates
 * - Ensures data normalization by storing only the Location reference
 */
export async function updateEvent(req, res) {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      locationLat,
      locationLon,
    } = req.body;

    // Update simple fields
    req.event.title = title;
    req.event.description = description;
    req.event.date = new Date(date);
    req.event.time = time;
    req.event.capacity = capacity;

    // Resolve Location (same logic as event creation)
    let checkLocation = await Location.findOne({
      latitude: locationLat,
      longitude: locationLon,
    });

    if (!checkLocation) {
      checkLocation = await Location.create({
        name: location,
        address: location,
        latitude: locationLat,
        longitude: locationLon,
        source: "OSM",
      });
    }

    // Store correct Location reference
    req.event.location = checkLocation._id;

    await req.event.save();

    req.flash("success", "Evento atualizado com sucesso.");
    return res.redirect(`/events/${req.event._id}`);

  } catch (error) {
    console.error("Error updating event:", error);
    req.flash("error", "Ocorreu um erro ao atualizar o evento.");
    return res.redirect(`/events/${req.event._id}/edit`);
  }
}

/**
 * Delete an event.
 * Route must be protected (owner or admin).
 */
export async function deleteEvent(req, res) {
  await req.event.deleteOne();
  req.flash("success", "Evento eliminado com sucesso.");
  res.redirect("/events");
}

export default {
  listEvents,
  showCreateEventForm,
  createEvent,
  myEvents,
  showEvent,
  participateInEvent,
  leaveEvent,
  showUpdateEventForm,
  updateEvent,
  deleteEvent,
};
