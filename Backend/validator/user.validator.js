import { body, query, validationResult } from "express-validator";

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

export const updateProfileValidation = [
  body("name")
    .optional()
    .isString().withMessage("Name must be a string")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("location")
    .optional()
    .isString().withMessage("Location must be a string")
    .isLength({ min: 2, max: 120 }).withMessage("Location must be between 2 and 120 characters"),
  body("password")
    .optional()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("currentPassword")
    .optional()
    .isLength({ min: 6 }).withMessage("Current password must be at least 6 characters"),
  body("currentPassword").custom((value, { req }) => {
    if (req.body.password !== undefined && !value) {
      throw new Error("Current password is required when updating password");
    }
    return true;
  }),
  validateRequest,
];

export const providerFilterValidation = [
  query("location")
    .optional()
    .isString().withMessage("Location must be a string"),
  validateRequest,
];
