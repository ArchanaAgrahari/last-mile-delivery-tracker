import RateCard from "../models/RateCard.js";

export const calculateCharge = async ({
  dimensions,
  actualWeight,
  orderType,
  paymentType,
  pickupZoneId,
  dropZoneId,
}) => {
  const { length, breadth, height } = dimensions;

  // Volumetric weight formula
  const volumetricWeight = (length * breadth * height) / 5000;
  const billedWeight = Math.max(actualWeight, volumetricWeight);

  const rateCard = await RateCard.findOne({ orderType });
  if (!rateCard) {
    throw new Error(`No rate card configured for order type: ${orderType}`);
  }

  const isIntraZone = pickupZoneId.toString() === dropZoneId.toString();
  const ratePerKg = isIntraZone
    ? rateCard.intraZoneRatePerKg
    : rateCard.interZoneRatePerKg;

  let charge = rateCard.baseCharge + billedWeight * ratePerKg;

  if (paymentType === "COD") {
    charge += rateCard.codSurcharge;
  }

  return {
    volumetricWeight: Number(volumetricWeight.toFixed(2)),
    billedWeight: Number(billedWeight.toFixed(2)),
    charge: Number(charge.toFixed(2)),
  };
};