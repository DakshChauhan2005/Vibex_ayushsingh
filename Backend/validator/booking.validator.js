import { body, param, query, validationResult } from "express-validator";

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

export const createBookingValidation = [
  body("serviceId").isMongoId().withMessage("Valid serviceId is required"),
  body("date").isISO8601().withMessage("Date must be a valid ISO date string"),
  validateRequest,
];

export const updateBookingStatusValidation = [
  param("id").isMongoId().withMessage("Invalid booking id"),
  body("status")
    .isIn(["accepted", "rejected", "completed"])
    .withMessage("Status must be accepted, rejected, or completed"),
  validateRequest,
];

export const bookingListQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  validateRequest,
];
