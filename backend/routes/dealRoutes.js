import express from "express";
import { addDeal, getDeals, updateDeal, deleteDeal, getMyDeals } from "../controllers/dealController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateDeal } from "../middleware/validationMiddleware.js";
import { upload } from "../controllers/dealController.js";

const router = express.Router();

// Public route to get all deals
router.get("/", getDeals);

// ✅ New route to get only logged-in user's deals
router.get("/my-deals", protect, getMyDeals);

// Protected routes that require authentication
router.post("/", protect, upload.single("image"), validateDeal, addDeal);
router.route("/:id")
  .put(protect, validateDeal, updateDeal)
  .delete(protect, deleteDeal);

export default router;
