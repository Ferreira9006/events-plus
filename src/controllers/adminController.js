// src/controllers/admin/adminController.js

import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Location from "../models/location.model.js";

/**
 * Render the admin dashboard.
 *
 * - Aggregates high-level platform statistics
 * - Counts users, events and locations
 * - Uses parallel queries for performance
 *
 * Route must be protected with `requireAdmin`.
 */
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

    return res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        users: usersCount,
        events: eventsCount,
        locations: locationsCount,
      },
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    req.flash("error", "Erro ao carregar o painel de administração.");
    return res.redirect("/");
  }
}

export default {
  showAdminDashboard,
};
