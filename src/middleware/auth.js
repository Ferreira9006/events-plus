// src/middleware/auth.js

/**
 * Authentication Middleware
 *
 * Provides route-level access control based on user authentication state.
 */

/**
 * Ensure the user is authenticated.
 *
 * - Allows the request to proceed if a valid session exists
 * - Redirects unauthenticated users to the login page
 *
 * Usage:
 *   router.get("/protected-route", requireAuth, controllerAction);
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

/**
 * Redirect authenticated users away from authentication pages.
 *
 * - Prevents logged-in users from accessing login or registration pages
 * - Improves UX by avoiding redundant authentication flows
 *
 * Usage:
 *   router.get("/auth/login", redirectIfAuth, showLogin);
 */
export function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/dashboard");
  }
  next();
}
