import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true, trim: true },

    date: { type: Date, required: true },

    time: { type: String, required: true },

    location: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Location",
      required: true,
     },

    capacity: { type: Number, required: true, min: 1 },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["OPEN", "FULL", "CANCELLED", "FINISHED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
