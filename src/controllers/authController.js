// src/controllers/authController.js

import bcrypt from "bcrypt";
import User from "../models/user.model.js";

/**
 * Authentication Controller
 *
 * Handles:
 * - User login
 * - User registration
 * - Session management
 */

/**
 * Render the login page.
 */
function showLogin(req, res) {
  res.render("auth/login", { title: "Login" });
}

/**
 * Handle user login.
 *
 * - Validates required fields
 * - Checks if the user exists
 * - Compares the provided password with the stored hash
 * - Stores user data in the session upon successful authentication
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      req.flash("error", "E-mail e password são obrigatórios.");
      return res.redirect("/auth/login");
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "E-mail ou password inválidos.");
      return res.redirect("/auth/login");
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      req.flash("error", "E-mail ou password inválidos.");
      return res.redirect("/auth/login");
    }

    // Store essential user information in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash("success", `Bem-vindo de volta, ${user.name}!`);
    return res.redirect("/dashboard");

  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Server error. Try again later.");
    return res.redirect("/auth/login");
  }
}

/**
 * Render the registration page.
 */
function showRegister(req, res) {
  res.render("auth/register", { title: "Register" });
}

/**
 * Handle user registration.
 *
 * - Validates required fields
 * - Prevents duplicate email registration
 * - Creates a new user with a hashed password
 * - Redirects to login page upon success
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      req.flash("error", "Todos os campos são obrigatórios.");
      return res.render("auth/register", {
        old: { name, email },
      });
    }

    // Check if email is already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      req.flash("error", "O email já está em uso.");
      return res.render("auth/register", {
        old: { name, email },
      });
    }

    // Create new user instance
    const newUser = new User({
      name,
      email,
      passwordHash: password, // Hashing is handled in the User model pre-save hook
    });

    // Persist user to database
    await newUser.save();

    req.flash(
      "success",
      "Registo realizado com sucesso. Por favor, inicie sessão."
    );
    return res.redirect("/auth/login");

  } catch (error) {
    console.error("Registration error:", error);

    // Render form again with error message and preserved input data
    return res.status(500).render("auth/register", {
      error: "Server error. Try again later.",
      old: { name, email },
    });
  }
}

/**
 * Log the user out by destroying the session.
 */
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

export default {
  showLogin,
  showRegister,
  login,
  register,
  logout,
};
