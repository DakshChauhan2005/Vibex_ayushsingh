import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} from "../controller/booking.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  bookingListQueryValidation,
  createBookingValidation,
  updateBookingStatusValidation,
} from "../validator/booking.validator.js";

const router = Router();

router.post("/", authUser, allowRoles("user"), createBookingValidation, createBooking);
router.get("/my-bookings", authUser, allowRoles("user", "admin"), bookingListQueryValidation, getMyBookings);
router.get("/provider", authUser, allowRoles("provider", "admin"), bookingListQueryValidation, getProviderBookings);
router.put("/:id/status", authUser, allowRoles("provider", "admin"), updateBookingStatusValidation, updateBookingStatus);

export default router;
