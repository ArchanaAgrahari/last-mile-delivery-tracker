import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { createAgent, getAgents, updateAgentAvailability } from "../controllers/agentController.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize("admin"), getAgents);
router.post("/", authorize("admin"), createAgent);
router.put("/:id/availability", authorize("agent", "admin"), updateAgentAvailability);

export default router;