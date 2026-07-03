import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { createZone, getZones, updateZone, deleteZone } from "../controllers/zoneController.js";

const router = express.Router();
router.use(protect);

router.get("/", getZones);
router.post("/", authorize("admin"), createZone);
router.put("/:id", authorize("admin"), updateZone);
router.delete("/:id", authorize("admin"), deleteZone);

export default router;