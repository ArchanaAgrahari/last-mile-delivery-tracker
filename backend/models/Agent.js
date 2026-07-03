import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);