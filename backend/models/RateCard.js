import mongoose from "mongoose";

const rateCardSchema = new mongoose.Schema(
  {
    orderType: { type: String, enum: ["B2B", "B2C"], required: true },
    intraZoneRatePerKg: { type: Number, required: true },
    interZoneRatePerKg: { type: Number, required: true },
    baseCharge: { type: Number, default: 0 },
    codSurcharge: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("RateCard", rateCardSchema);