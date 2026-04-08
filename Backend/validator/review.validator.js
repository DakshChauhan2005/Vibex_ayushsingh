import { body, param, validationResult } from "express-validator";

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  return next();
}

export const createReviewValidation = [
  body("serviceId").isMongoId().withMessage("Valid serviceId is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString().withMessage("Comment must be a string"),
  validateRequest,
];

export const reviewByServiceValidation = [
  param("id").isMongoId().withMessage("Invalid service id"),
  validateRequest,
];

export const deleteReviewValidation = [
  param("id").isMongoId().withMessage("Invalid review id"),
  validateRequest,
];
