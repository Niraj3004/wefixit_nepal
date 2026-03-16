import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router = Router();

// PROTECTED: Clients can create a repair booking
router.post(
  "/",
  AuthMiddleware.isAuthenticated,
  bookingController.createBooking
);

// PROTECTED: Clients can view their entire booking history
router.get(
  "/",
  AuthMiddleware.isAuthenticated,
  bookingController.getMyBookings
);

export default router;
