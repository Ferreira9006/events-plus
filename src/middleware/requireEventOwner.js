import Event from "../models/event.model.js";

export async function requireEventOwner(req, res, next) {
  const userId = req.session.user.id;
  const eventId = req.params.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.render("events/show", {
      title: "Evento",
      error: "Evento não encontrado."
    });
  }

  if (event.organizer.toString() !== userId) {
    return res.render("events/show", {
      title: event.title,
      event,
      error: "Não tens permissão para executar esta ação."
    });
  }

  // Attach event to request to avoid refetching
  req.event = event;
  next();
}
