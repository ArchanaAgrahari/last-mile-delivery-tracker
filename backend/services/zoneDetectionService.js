import Zone from "../models/Zone.js";

// Detects zone by matching area name mentioned in the address
export const detectZone = async (address) => {
  const zones = await Zone.find();
  const matchedZone = zones.find((zone) =>
    zone.areas.some((area) =>
      address.toLowerCase().includes(area.toLowerCase())
    )
  );
  if (!matchedZone) {
    throw new Error(`No zone configured for address: ${address}`);
  }
  return matchedZone;
};