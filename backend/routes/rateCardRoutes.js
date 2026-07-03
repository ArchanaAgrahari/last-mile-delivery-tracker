import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { createRateCard, getRateCards, updateRateCard } from "../controllers/rateCardController.js";

const router = express.Router();
router.use(protect);

router.get("/", getRateCards);
router.post("/", authorize("admin"), createRateCard);
router.put("/:id", authorize("admin"), updateRateCard);

export default router;