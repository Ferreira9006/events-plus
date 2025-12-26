import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Location from "../models/location.model.js";




export async function showAdminDashboard(req, res) {
  try {
    const [
      usersCount,
      eventsCount,
      locationsCount
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Location.countDocuments()
    ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        users: usersCount,
        events: eventsCount,
        locations: locationsCount
      }
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    req.flash("error", "Erro ao carregar o painel de administração.");
    res.redirect("/");
  }
}

export default {
  showAdminDashboard,
};