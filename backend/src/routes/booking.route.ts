import express, { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

// PROTECTED: Clients can create a repair booking

router
  .route("/")
  .post(AuthMiddleware.isAuthenticated, bookingController.createBooking);
router
  .route("/")
  .get(AuthMiddleware.isAuthenticated, bookingController.getMyBookings);

export default router;
