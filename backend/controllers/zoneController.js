import Zone from "../models/Zone.js";

export const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZones = async (req, res) => {
  const zones = await Zone.find();
  res.json(zones);
};

export const updateZone = async (req, res) => {
  const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(zone);
};

export const deleteZone = async (req, res) => {
  await Zone.findByIdAndDelete(req.params.id);
  res.json({ message: "Zone deleted" });
};