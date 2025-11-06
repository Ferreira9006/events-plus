import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "ORGANIZER", "PARTICIPANT"],
    default: "PARTICIPANT",
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;