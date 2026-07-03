import Agent from "../models/Agent.js";

// Auto-assign nearest available agent in the pickup zone
export const autoAssignAgent = async (pickupZoneId) => {
  const availableAgents = await Agent.find({
    zone: pickupZoneId,
    isAvailable: true,
  });

  if (availableAgents.length === 0) {
    return null; // no agent available, order stays unassigned
  }

  // Simple nearest logic: first available in zone (extendable to lat/lng distance calc)
  const assignedAgent = availableAgents[0];
  assignedAgent.isAvailable = false;
  await assignedAgent.save();

  return assignedAgent;
};

export const reassignAgent = async (pickupZoneId, previousAgentId) => {
  // Free up the previous agent
  if (previousAgentId) {
    await Agent.findByIdAndUpdate(previousAgentId, { isAvailable: true });
  }
  return await autoAssignAgent(pickupZoneId);
};