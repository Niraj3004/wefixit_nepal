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

export default router;
