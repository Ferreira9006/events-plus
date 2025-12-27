// src/middleware/requireAdmin.js

/**
 * Ensure the user has administrative privileges.
 *
 * - Checks for an active authenticated session
 * - Verifies the user role is `ADMIN`
 * - Redirects unauthorized users with a flash message
 *
 * Intended for admin-only routes.
 */
export function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "ADMIN") {
    req.flash("error", "Acesso restrito a administradores.");
    return res.redirect("/");
  }

  next();
}
