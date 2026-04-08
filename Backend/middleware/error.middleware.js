import { errorResponse } from "../utils/apiResponse.js";

export function notFoundHandler(req, res) {
  return errorResponse(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    // Keep error details in non-production for debugging.
    return errorResponse(res, {
      statusCode,
      message,
      errors: {
        stack: err.stack,
      },
    });
  }

  return errorResponse(res, { statusCode, message });
}
