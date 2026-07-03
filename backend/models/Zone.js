import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    areas: [{ type: String, required: true }], // e.g. ["Kanpur", "Lucknow"]
  },
  { timestamps: true }
);

export default mongoose.model("Zone", zoneSchema);