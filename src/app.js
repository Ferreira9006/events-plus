import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Route testing
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "API is running." });
});

export default app;