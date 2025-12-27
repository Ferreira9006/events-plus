// src/controllers/admin/adminLocationsController.js

import Location from "../../models/location.model.js";

/**
 * List all locations (admin view).
 *
 * - Fetches all locations from the database
 * - Renders the admin locations index page
 *
 * Route must be protected with `requireAdmin`.
 */
export async function index(req, res) {
  try {
    const locations = await Location.find().lean();

    return res.render("admin/locations/index", {
      title: "Locations Index",
      locations,
    });

  } catch (error) {
    console.error("Admin locations error:", error);

    req.flash("error", "Erro ao carregar o painel de administração.");
    return res.redirect("/dashboard");
  }
}

/**
 * Show details of a single location (admin view).
 *
 * - Fetches location by ID
 * - Displays read-only location information
 */
export async function show(req, res) {
  try {
    const location = await Location.findById(req.params.id).lean();

    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }

    return res.render("admin/locations/show", {
      title: `Location: ${location.name}`,
      location,
    });

  } catch (error) {
    console.error("Admin location show error:", error);
    req.flash("error", "Erro ao carregar a localização.");
    return res.redirect("/admin/locations");
  }
}

/**
 * Render the location edit form (admin view).
 *
 * - Fetches the location by ID
 * - Pre-fills the edit form with existing data
 */
export async function showEditForm(req, res) {
  try {
    const location = await Location.findById(req.params.id).lean();

    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }

    return res.render("admin/locations/edit", {
      title: `Edit Location: ${location.name}`,
      location,
    });

  } catch (error) {
    console.error("Admin location edit form error:", error);
    req.flash("error", "Erro ao carregar o formulário de edição.");
    return res.redirect("/admin/locations");
  }
}

/**
 * Update an existing location.
 *
 * - Updates editable fields (address, coordinates, source)
 * - Uses `findByIdAndUpdate` for atomic update
 * - Redirects back to the location detail page
 */
export async function update(req, res) {
  try {
    const { address, latitude, longitude, source } = req.body;

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { address, latitude, longitude, source },
      { new: true }
    ).lean();

    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }

    req.flash("success", "Localização atualizada com sucesso.");
    return res.redirect(`/admin/locations/${location._id}`);

  } catch (error) {
    console.error("Admin location update error:", error);
    req.flash("error", "Erro ao atualizar a localização.");
    return res.redirect("/admin/locations");
  }
}

/**
 * Render the location creation form (admin view).
 */
export async function showCreateForm(req, res) {
  try {
    return res.render("admin/locations/create", {
      title: "Create Location",
    });

  } catch (error) {
    console.error("Admin locations error:", error);
    req.flash("error", "Erro ao carregar o formulário de criação.");
    return res.redirect("/dashboard");
  }
}

/**
 * Create a new location.
 *
 * - Validates uniqueness by address
 * - Automatically derives the location name from the address
 * - Persists the new location in the database
 */
export async function create(req, res) {
  try {
    const { address, latitude, longitude, source } = req.body;

    const existingLocation = await Location.findOne({ address }).lean();
    if (existingLocation) {
      req.flash("error", "Uma localização com este endereço já existe.");
      return res.redirect("/admin/locations/create");
    }

    // Name is derived from address for consistency
    const name = address;

    const newLocation = new Location({
      name,
      address,
      latitude,
      longitude,
      source,
    });

    await newLocation.save();

    req.flash("success", "Localização criada com sucesso.");
    return res.redirect(`/admin/locations/${newLocation._id}`);

  } catch (error) {
    console.error("Admin location create error:", error);
    req.flash("error", "Erro ao criar a localização.");
    return res.redirect("/admin/locations");
  }
}

/**
 * Delete a location.
 *
 * - Removes the location by ID
 * - Redirects back to the admin locations index
 */
export async function remove(req, res) {
  try {
    const location = await Location.findByIdAndDelete(req.params.id).lean();

    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }

    req.flash("success", "Localização eliminada com sucesso.");
    return res.redirect("/admin/locations");

  } catch (error) {
    console.error("Admin location delete error:", error);
    req.flash("error", "Erro ao eliminar a localização.");
    return res.redirect("/admin/locations");
  }
}

export default {
  index,
  show,
  showEditForm,
  update,
  showCreateForm,
  create,
  remove,
};
