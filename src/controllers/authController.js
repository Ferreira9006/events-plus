import User from "../models/user.model.js";

/* 
Auth Controller
Handles user login, registration and authentication logic
*/

// Render login page
function showLogin(req, res) {
  res.render("auth/login");
}

// Handle login logic
async function login(req, res) { }

// Render registration page
function showRegister(req, res) {
  res.render("auth/register");
}

// Handle user registration
async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.render("auth/register", {
        error: "All fields are required",
        old: { name, email }
      });
    }

    // Check if the email is already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.render("auth/register", {
        error: "Email already in use",
        old: { name, email }
      });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      passwordHash: password
    });

    // Save user to the database
    await newUser.save();

    // Redirect to login page after successful registration
    return res.redirect("/auth/login");

  } catch (error) {
    console.error("Registration error:", error);

    // Render page with error message and preserved form data
    return res.status(500).render("auth/register", {
      error: "Server error. Try again later.",
      old: { name, email }
    });
  }
}

export default {
  showLogin,
  showRegister,
  login,
  register
};
