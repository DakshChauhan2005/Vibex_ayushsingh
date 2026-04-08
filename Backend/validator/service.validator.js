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

export const createServiceValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  validateRequest,
];

export const updateServiceValidation = [
  param("id").isMongoId().withMessage("Invalid service id"),
  body("title").optional().isString().withMessage("Title must be a string"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("category").optional().isString().withMessage("Category must be a string"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("location").optional().isString().withMessage("Location must be a string"),
  validateRequest,
];

export const getServiceByIdValidation = [
  param("id").isMongoId().withMessage("Invalid service id"),
  validateRequest,
];

export const listServiceValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be positive"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be positive"),
  query("sortBy").optional().isIn(["price", "rating", "createdAt"]).withMessage("sortBy must be price, rating, or createdAt"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("order must be asc or desc"),
  validateRequest,
];
