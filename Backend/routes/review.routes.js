import { Router } from "express";
import { createReview, deleteReview, getReviewsByService } from "../controller/review.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { createReviewValidation, deleteReviewValidation, reviewByServiceValidation } from "../validator/review.validator.js";

const router = Router();

router.post("/", authUser, createReviewValidation, createReview);
router.get("/service/:id", reviewByServiceValidation, getReviewsByService);
router.delete("/:id", authUser, deleteReviewValidation, deleteReview);

export default router;
