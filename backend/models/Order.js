import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByAdmin: { type: Boolean, default: false },

    pickupAddress: { type: String, required: true },
    dropAddress: { type: String, required: true },
    pickupZone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    dropZone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },

    dimensions: {
      length: Number,
      breadth: Number,
      height: Number,
    },
    actualWeight: { type: Number, required: true },
    volumetricWeight: { type: Number },
    billedWeight: { type: Number },

    orderType: { type: String, enum: ["B2B", "B2C"], required: true },
    paymentType: { type: String, enum: ["Prepaid", "COD"], required: true },

    charge: { type: Number },

    status: {
      type: String,
      enum: [
        "Created",
        "Picked Up",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Failed",
        "Rescheduled",
      ],
      default: "Created",
    },

    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },

    rescheduledDate: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);