import Location from "../../models/location.model.js";

export async function index(req, res) {
  try {
    const locations = await Location.find().lean();

    res.render("admin/locations/index", {
      title: "Locations Index",
      locations,
    });

  } catch (error) {
    console.error("Admin locations error:", error);

    req.flash("error", "Erro ao carregar o painel de administração.");
    res.redirect("/dashboard");
  }
}

export async function show(req, res) {
  try {
    const location = await Location.findById(req.params.id).lean();
    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }
    res.render("admin/locations/show", {
      title: `Location: ${location.name}`,
      location,
    });
  } catch (error) {
    console.error("Admin location show error:", error);
    req.flash("error", "Erro ao carregar a localização.");
    res.redirect("/admin/locations");
  }
}

export default {
  index,
  show,
};