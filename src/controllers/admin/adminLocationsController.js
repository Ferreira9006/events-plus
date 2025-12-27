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

export async function showEditForm(req, res) {
  try {
    const location = await Location.findById(req.params.id).lean();
    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }
    res.render("admin/locations/edit", {
      title: `Edit Location: ${location.name}`,
      location,
    });
  } catch (error) {
    console.error("Admin location edit form error:", error);
    req.flash("error", "Erro ao carregar o formulário de edição.");
    res.redirect("/admin/locations");
  }
}

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
      res.redirect("/admin/locations");
    }

    req.flash("success", "Localização atualizada com sucesso.");
    res.redirect(`/admin/locations/${location._id}`);


  } catch (error) {
    console.error("Admin location update error:", error);
    req.flash("error", "Erro ao atualizar a localização.");
    res.redirect("/admin/locations");
  }
}

export async function showCreateForm(req, res) {
  try {
    res.render("admin/locations/create", {
      title: "Create Location"
    });

  } catch (error) {
    console.error("Admin locations error:", error);

    req.flash("error", "Erro ao carregar o formulário de criação.");
    res.redirect("/dashboard");
  }
}

export async function create(req, res) {
  try {
    const { address, latitude, longitude, source } = req.body;

    const location = await Location.findOne({ address }).lean();
    if (location) {
      req.flash("error", "Uma localização com este endereço já existe.");
      return res.redirect("/admin/locations/create");
    }

    const name = address;

    const newLocation = new Location({ name, address, latitude, longitude, source });
    await newLocation.save();

    req.flash("success", "Localização criada com sucesso.");
    res.redirect(`/admin/locations/${newLocation._id}`);

  } catch (error) {
    console.error("Admin location create error:", error);
    req.flash("error", "Erro ao criar a localização.");
    res.redirect("/admin/locations");
  }
}

export async function remove(req, res) {
  try {
    const location = await Location.findByIdAndDelete(req.params.id).lean();
    if (!location) {
      req.flash("error", "Localização não encontrada.");
      return res.redirect("/admin/locations");
    }
    req.flash("success", "Localização deletada com sucesso.");
    res.redirect("/admin/locations");
  } catch (error) {
    console.error("Admin location delete error:", error);
    req.flash("error", "Erro ao deletar a localização.");
    res.redirect("/admin/locations");
  }
}

export default {
  index,
  show,
  showEditForm,
  update,
  showCreateForm,
  create,
  remove
};