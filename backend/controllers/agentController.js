import Agent from "../models/Agent.js";

export const createAgent = async (req, res) => {
  try {
    const agent = await Agent.create(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgents = async (req, res) => {
  const agents = await Agent.find().populate("user zone");
  res.json(agents);
};

export const updateAgentAvailability = async (req, res) => {
  const agent = await Agent.findByIdAndUpdate(
    req.params.id,
    { isAvailable: req.body.isAvailable },
    { new: true }
  );
  res.json(agent);
};