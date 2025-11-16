import bcrypt from "bcrypt";
import User from "../models/user.model.js";

/* 
Auth Controller
Handles user login, registration and authentication logic
*/

// Render login page
function showLogin(req, res) {
  res.render("auth/login", { title: "Login" });
}

// Handle login logic
async function login(req, res) {
  const { email, password } = req.body;
  try {
    // Validate required fields
    if (!email || !password) {
      return res.render("auth/login", {
        error: "Email and password are required",
        old: { email }
      });
    }

    // Finds the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/login", {
        error: "Invalid email or password",
        old: { email }
      });
    }

    // Compares the provided password with the stored hash password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.render("auth/login", {
        error: "Invalid email or password",
        old: { email }
      });
    }

    // Store user info in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    
    return res.redirect("/dashboard");

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("auth/login", {
      error: "Server error. Try again later.",
      old: { email }
    });
  }
 }

// Render registration page
function showRegister(req, res) {
  res.render("auth/register", { title: "Register" });
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
  logout
};
