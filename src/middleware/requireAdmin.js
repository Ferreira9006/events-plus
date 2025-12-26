export function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "ADMIN") {
    req.flash("error", "Acesso restrito a administradores.");
    return res.redirect("/");
  }
  next();
}
