import { errorResponse } from "../utils/apiResponse.js";

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Forbidden: insufficient permissions",
      });
    }

    return next();
  };
}
