import bookingModel from "../model/booking.model.js";
import serviceModel from "../model/service.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "accepted"];

function normalizePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit ?? "10", 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function canTransition(currentStatus, nextStatus) {
  if (currentStatus === "pending" && ["accepted", "rejected"].includes(nextStatus)) {
    return true;
  }
  if (currentStatus === "accepted" && nextStatus === "completed") {
    return true;
  }
  return false;
}

export async function createBooking(req, res) {
  try {
    const { serviceId, date } = req.body;

    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return errorResponse(res, { statusCode: 404, message: "Service not found" });
    }

    if (req.user.role !== "user") {
      return errorResponse(res, { statusCode: 403, message: "Only customers can create bookings" });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return errorResponse(res, { statusCode: 400, message: "Invalid booking date" });
    }

    if (bookingDate <= new Date()) {
      return errorResponse(res, { statusCode: 400, message: "Booking date must be in the future" });
    }

    const existingBooking = await bookingModel.findOne({
      provider: service.provider,
      date: bookingDate,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    });

    if (existingBooking) {
      return errorResponse(res, {
        statusCode: 409,
        message: "Selected time slot is already booked",
      });
    }

    const booking = await bookingModel.create({
      user: req.user.id,
      provider: service.provider,
      service: service._id,
      date: bookingDate,
      status: "pending",
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Booking created successfully",
      data: { booking },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to create booking", errors: error.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const { page, limit, skip } = normalizePagination(req.query);
    const filter = { user: req.user.id };

    const [bookings, total] = await Promise.all([
      bookingModel
        .find(filter)
        .populate("service", "title category price location")
        .populate("provider", "name email location")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      bookingModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return successResponse(res, {
      message: "My bookings fetched successfully",
      data: { bookings },
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch bookings", errors: error.message });
  }
}

export async function getProviderBookings(req, res) {
  try {
    const { page, limit, skip } = normalizePagination(req.query);
    const filter = { provider: req.user.id };

    const [bookings, total] = await Promise.all([
      bookingModel
        .find(filter)
        .populate("service", "title category price location")
        .populate("user", "name email location")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      bookingModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return successResponse(res, {
      message: "Provider bookings fetched successfully",
      data: { bookings },
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch provider bookings", errors: error.message });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;

    const booking = await bookingModel.findById(req.params.id).populate("service", "provider");
    if (!booking) {
      return errorResponse(res, { statusCode: 404, message: "Booking not found" });
    }

    const isProviderOwner = booking.provider.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isProviderOwner && !isAdmin) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: not allowed to update booking status" });
    }

    if (!canTransition(booking.status, status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid status transition from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;
    await booking.save();

    return successResponse(res, {
      message: "Booking status updated successfully",
      data: { booking },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to update booking status", errors: error.message });
  }
}
