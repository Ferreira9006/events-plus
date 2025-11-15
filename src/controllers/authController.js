/* 
Auth Controller
Handles user authentication logic
*/

// Display login page
function showLogin(req, res) {
  res.render("auth/login");
  
}

function showRegister(req, res) {
  res.render("auth/register");
}

async function login(req, res) {
  // validates user credentials
}

async function register(req, res) {
  // creates a new user
}

export default {
  showLogin,
  showRegister,
  login,
  register
}