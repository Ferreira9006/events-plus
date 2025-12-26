// src/controllers/eventController.js
import Event from "../models/event.model.js";
import Location from "../models/location.model.js";

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

    // Checks if the user is already a participant for each event
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
    const { title, description, date, time, location, capacity, locationLat, locationLon } = req.body;
    const userId = req.session.user.id;

    // Basic validation for required fields
    if (!title || !description || !date || !time || !location || !capacity) {
      req.flash("error", "Por favor, preenche todos os campos obrigatórios.");
      return res.redirect("/events/create");
    }

    let checkLocation = await Location.findOne({
      latitude: locationLat,
      longitude: locationLon
    });

    if (!checkLocation) {
      checkLocation = await Location.create({
        name: location,
        address: location,
        latitude: locationLat,
        longitude: locationLon,
        source: "OSM"
      });
    }

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

    req.flash("error", "Ocorreu um erro ao carregar os teus eventos.");
    return res.status(500).render("events/mine", {
      title: "Os meus eventos",
      events: [],
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
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    // Check if the logged-in user is a participant
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
      isOwner
    });

  } catch (error) {
    console.error("Error fetching event details:", error);
    req.flash("error", "Ocorreu um erro ao carregar este evento.");
    return res.redirect("/events");
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
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    // Event must be open for participation
    if (event.status !== "OPEN") {
      req.flash("error", "Este evento não está aberto a novas inscrições.");
      return res.redirect("/events");
    }

    // Check if user is already a participant
    const alreadyParticipant = event.participants.some((p) => p.id === userId);

    if (alreadyParticipant) {
      req.flash("error", "Já estás inscrito neste evento.");
      return res.redirect(`/events/${event._id}`);
    }

    // Check capacity before adding the user
    if (event.participants.length >= event.capacity) {
      event.status = "FULL";
      await event.save();

      req.flash("error", "Este evento já atingiu a lotação máxima.");
      return res.redirect(`/events/${event._id}`);
    }

    // Add user as participant
    event.participants.push(userId);

    // If capacity reached after adding this user, mark as FULL
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


//  Removes the logged-in user from the participants of an event
//  Route must be protected with requireAuth
export async function leaveEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      req.flash("error", "Este evento não existe ou foi removido.");
      return res.redirect("/events");
    }

    event.participants = event.participants.filter(
      p => p.toString() !== userId
    );

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

export async function showUpdateEventForm(req, res) {
  const event = await req.event.populate("location");

  // Converts date to YYYY-MM-DD format for input fields
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

    // Atualizar campos simples
    req.event.title = title;
    req.event.description = description;
    req.event.date = new Date(date);
    req.event.time = time;
    req.event.capacity = capacity;

    // Resolver Location (igual ao create)
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

    // Guardar referência correta
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
  deleteEvent
};
