import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import { fileURLToPath } from "url";

import { requireAuth } from './middleware/auth.js';
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Mitigates XSS attacks by preventing client-side JS from accessing the cookie
    maxAge: 1000 * 60 * 60 // 1 hour
  }
})
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Routes
app.get("/", (req, res) => {
  res.render("welcome", { title: "Welcome" });
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.session.user });
});

app.use("/auth", authRoutes);
  
app.use("/events", eventRoutes);


export default app;