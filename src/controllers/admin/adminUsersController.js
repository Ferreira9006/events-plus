// src/controllers/admin/adminUsersController.js

import User from "../../models/user.model.js";

/**
 * List all users (admin view).
 */
export async function index(req, res) {
  try {
    const users = await User.find().lean();

    return res.render("admin/users/index", {
      title: "Gestão de Utilizadores",
      users,
    });

  } catch (error) {
    console.error("Admin users index error:", error);
    req.flash("error", "Erro ao carregar os utilizadores.");
    return res.redirect("/admin");
  }
}

/**
 * Show details of a single user.
 */
export async function show(req, res) {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      req.flash("error", "Utilizador não encontrado.");
      return res.redirect("/admin/users");
    }

    return res.render("admin/users/show", {
      title: `Utilizador: ${user.name}`,
      user,
    });

  } catch (error) {
    console.error("Admin user show error:", error);
    req.flash("error", "Erro ao carregar o utilizador.");
    return res.redirect("/admin/users");
  }
}

/**
 * Render the user edit form.
 */
export async function showEditForm(req, res) {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      req.flash("error", "Utilizador não encontrado.");
      return res.redirect("/admin/users");
    }

    return res.render("admin/users/edit", {
      title: `Editar Utilizador: ${user.name}`,
      user,
    });

  } catch (error) {
    console.error("Admin user edit form error:", error);
    req.flash("error", "Erro ao carregar o formulário.");
    return res.redirect("/admin/users");
  }
}

/**
 * Update a user.
 *
 * - Allows role changes (ADMIN / USER)
 * - Does not handle password changes
 */
export async function update(req, res) {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).lean();

    if (!user) {
      req.flash("error", "Utilizador não encontrado.");
      return res.redirect("/admin/users");
    }

    req.flash("success", "Utilizador atualizado com sucesso.");
    return res.redirect(`/admin/users/${user._id}`);

  } catch (error) {
    console.error("Admin user update error:", error);
    req.flash("error", "Erro ao atualizar o utilizador.");
    return res.redirect("/admin/users");
  }
}

/**
 * Delete a user.
 *
 * - Prevents self-deletion
 */
export async function remove(req, res) {
  try {
    if (req.session.user.id === req.params.id) {
      req.flash("error", "Não podes eliminar o teu próprio utilizador.");
      return res.redirect("/admin/users");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      req.flash("error", "Utilizador não encontrado.");
      return res.redirect("/admin/users");
    }

    req.flash("success", "Utilizador eliminado com sucesso.");
    return res.redirect("/admin/users");

  } catch (error) {
    console.error("Admin user delete error:", error);
    req.flash("error", "Erro ao eliminar o utilizador.");
    return res.redirect("/admin/users");
  }
}

export default {
  index,
  show,
  showEditForm,
  update,
  remove,
};
