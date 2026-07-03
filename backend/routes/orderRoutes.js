import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  previewCharge, createOrder, assignAgent, updateOrderStatus,
  rescheduleOrder, getOrders, getOrderTimeline, overrideStatus,
} from "../controllers/orderController.js";

const router = express.Router();
router.use(protect);

router.post("/preview-charge", previewCharge);
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id/timeline", getOrderTimeline);
router.put("/:id/assign", authorize("admin"), assignAgent);
router.put("/:id/status", authorize("agent", "admin"), updateOrderStatus);
router.put("/:id/reschedule", rescheduleOrder);
router.put("/:id/override", authorize("admin"), overrideStatus);

export default router;