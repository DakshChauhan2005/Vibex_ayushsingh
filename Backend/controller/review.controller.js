import reviewModel from "../model/review.model.js";
import serviceModel from "../model/service.model.js";
import bookingModel from "../model/booking.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export async function createReview(req, res) {
  try {
    const { serviceId, rating, comment } = req.body;

    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return errorResponse(res, { statusCode: 404, message: "Service not found" });
    }

    const hasCompletedBooking = await bookingModel.exists({
      user: req.user.id,
      service: serviceId,
      status: "completed",
    });

    if (!hasCompletedBooking) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Review allowed only after completed booking",
      });
    }

    const existingReview = await reviewModel.findOne({ user: req.user.id, service: serviceId });
    if (existingReview) {
      return errorResponse(res, {
        statusCode: 409,
        message: "You have already reviewed this service",
      });
    }

    const review = await reviewModel.create({
      user: req.user.id,
      service: serviceId,
      rating,
      comment,
    });

    await reviewModel.recalculateServiceRating(serviceId);

    return successResponse(res, {
      statusCode: 201,
      message: "Review added successfully",
      data: { review },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to create review", errors: error.message });
  }
}

export async function getReviewsByService(req, res) {
  try {
    const reviews = await reviewModel
      .find({ service: req.params.id })
      .populate("user", "name role")
      .sort({ createdAt: -1 });

    return successResponse(res, {
      message: "Reviews fetched successfully",
      data: { reviews },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch reviews", errors: error.message });
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await reviewModel.findById(req.params.id);
    if (!review) {
      return errorResponse(res, { statusCode: 404, message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: not allowed to delete this review" });
    }

    const serviceId = review.service;
    await review.deleteOne();
    await reviewModel.recalculateServiceRating(serviceId);

    return successResponse(res, {
      message: "Review deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to delete review", errors: error.message });
  }
}
