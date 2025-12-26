import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim: true },

    city: { type: String, trim: true },

    latitude: { type: Number, required: true },

    longitude: { type: Number, required: true },

    source: {
      type: String,
      enum: ["OSM", "MANUAL"],
      default: "OSM",
    }
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", LocationSchema);

export default Location;
