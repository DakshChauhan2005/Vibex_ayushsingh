import bookingModel from "../model/booking.model.js";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function getProviderDashboard(req, res) {
  try {
    const providerId = req.user.id;
    const providerObjectId = new mongoose.Types.ObjectId(providerId);

    const [aggregate] = await bookingModel.aggregate([
      {
        $match: {
          provider: providerObjectId,
          status: { $in: ["accepted", "completed"] },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceInfo",
        },
      },
      { $unwind: "$serviceInfo" },
      {
        $group: {
          _id: "$provider",
          totalBookings: { $sum: 1 },
          totalEarnings: { $sum: "$serviceInfo.price" },
        },
      },
    ]);

    return successResponse(res, {
      message: "Provider dashboard fetched successfully",
      data: {
        totalBookings: aggregate?.totalBookings || 0,
        totalEarnings: aggregate?.totalEarnings || 0,
      },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch provider dashboard", errors: error.message });
  }
}
