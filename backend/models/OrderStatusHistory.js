import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorRole: { type: String },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

// Immutable: no updates allowed once created
orderStatusHistorySchema.pre("findOneAndUpdate", function (next) {
  throw new Error("Order status history is immutable and cannot be updated");
});

export default mongoose.model("OrderStatusHistory", orderStatusHistorySchema);