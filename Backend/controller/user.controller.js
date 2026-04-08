import userModel from "../model/user.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: "User not found" });
    }

    return successResponse(res, {
      message: "Profile fetched successfully",
      data: { user },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch profile", errors: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowedFields = ["name", "location", "password"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: "User not found" });
    }

    if (updates.password !== undefined) {
      if (!req.body.currentPassword) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Current password is required to set a new password",
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(req.body.currentPassword);
      if (!isCurrentPasswordValid) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Current password is incorrect",
        });
      }
    }

    Object.assign(user, updates);
    await user.save();

    return successResponse(res, {
      message: "Profile updated successfully",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to update profile", errors: error.message });
  }
}

export async function getProviders(req, res) {
  try {
    const { location } = req.query;
    const query = { role: "provider" };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const providers = await userModel.find(query).select("name email role location createdAt");

    return successResponse(res, {
      message: "Providers fetched successfully",
      data: { providers },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch providers", errors: error.message });
  }
}
