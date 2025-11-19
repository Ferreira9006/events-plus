// src/controllers/eventController.js
import Event from "../models/event.model.js";

/*
  Lists all events (public)
  Renders the main events listing page
*/
export async function listEvents(req, res) {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("participants", "name email")
      .sort({ date: 1, time: 1, createdAt: -1 });

    return res.render("events/index", {
      title: "Eventos",
      events,
    });
  } catch (error) {
    console.error("Error listing events:", error);
    return res.status(500).render("events/index", {
      title: "Eventos",
      events: [],
      error: "Ocorreu um erro ao carregar os eventos.",
    });
  }
}

/*
  Renders the event creation form
  Route must be protected with requireAuth
*/
export function showCreateEventForm(req, res) {
  return res.render("events/create", {
    title: "Criar evento",
    formData: {},
  });
}

/*
  Creates a new event in the database
  Route must be protected with requireAuth
*/
export async function createEvent(req, res) {
  try {
    const { title, description, date, time, location, capacity } = req.body;
    const userId = req.session.user.id; // requireAuth guarantees this exists

    // Basic validation for required fields
    if (!title || !description || !date || !time || !location || !capacity) {
      return res.status(400).render("events/create", {
        title: "Criar evento",
        error: "Todos os campos são obrigatórios.",
        formData: req.body,
      });
    }

    await Event.create({
      title,
      description,
      date,
      time,
      location,
      capacity,
      organizer: userId,
      status: "OPEN",
    });

    return res.redirect("/events");
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).render("events/create", {
      title: "Criar evento",
      error: "Ocorreu um erro ao criar o evento. Tenta novamente.",
      formData: req.body,
    });
  }
}

/*
  Lists events created by the logged-in user
  Route must be protected with requireAuth
*/
export async function myEvents(req, res) {
  try {
    const userId = req.session.user.id;

    const events = await Event.find({ organizer: userId }).sort({
      date: 1,
      time: 1,
      createdAt: -1,
    });

    return res.render("events/mine", {
      title: "Os meus eventos",
      events,
    });
  } catch (error) {
    console.error("Error listing user events:", error);
    return res.status(500).render("events/mine", {
      title: "Os meus eventos",
      events: [],
      error: "Ocorreu um erro ao carregar os teus eventos.",
    });
  }
}

/*
  Shows details of a specific event (public)
*/
export async function showEvent(req, res) {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("organizer", "name email")
      .populate("participants", "name email");

    if (!event) {
      return res.status(404).render("events/show", {
        title: "Evento não encontrado",
        event: null,
        error: "Este evento não existe ou foi removido.",
      });
    }

    return res.render("events/show", {
      title: event.title,
      event,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return res.status(500).render("events/show", {
      title: "Erro ao carregar evento",
      event: null,
      error: "Ocorreu um erro ao carregar este evento.",
    });
  }
}

/*
  Adds the logged-in user as participant to an event
  Route must be protected with requireAuth
*/
export async function participateInEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;

    const event = await Event.findById(eventId).populate("participants", "id name email");

    if (!event) {
      return res.status(404).render("events/show", {
        title: "Evento não encontrado",
        event: null,
        error: "Este evento não existe ou foi removido.",
      });
    }

    // Event must be open for participation
    if (event.status !== "OPEN") {
      return res.status(400).render("events/show", {
        title: event.title,
        event,
        error: "Este evento não está aberto a novas inscrições.",
      });
    }

    // Check if user is already a participant
    const alreadyParticipant = event.participants.some((p) => p.id === userId);

    if (alreadyParticipant) {
      return res.status(400).render("events/show", {
        title: event.title,
        event,
        error: "Já estás inscrito neste evento.",
      });
    }

    // Check capacity before adding the user
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
      await event.save();

      return res.status(400).render("events/show", {
        title: event.title,
        event,
        error: "Este evento já atingiu a lotação máxima.",
      });
    }

    // Add user as participant
    event.participants.push(userId);

    // If capacity reached after adding this user, mark as FULL
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
    }

    await event.save();

    return res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Error participating in event:", error);
    return res.status(500).render("events/show", {
      title: "Erro ao participar",
      event: null,
      error: "Ocorreu um erro ao processar a tua participação.",
    });
  }
}

export default {
  listEvents,
  showCreateEventForm,
  createEvent,
  myEvents,
  showEvent,
  participateInEvent,
};
