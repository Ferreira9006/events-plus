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

export default { listEvents };
