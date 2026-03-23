import express, { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as invoiceController from "../controllers/invoice.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import RoleMiddleware from "../middlewares/role.middleware";

// Provide aliases for middleware to exactly match requested syntax
const authMiddleware = AuthMiddleware.isAuthenticated;
const authorizeRole = (role: string) => RoleMiddleware.restrictTo(role as any);

const router: Router = express.Router();

router.route("/dashboard").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getDashboardStats
);

router.route("/users").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllUsers
);

router.route("/users/:id").delete(
  authMiddleware,
  authorizeRole("admin"),
  adminController.deleteUser
);

router.route("/bookings").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllBookings
);

router.route("/booking/:id").put(
  authMiddleware,
  authorizeRole("admin"),
  adminController.updateBookingStatus
);

router.route("/tracking/:bookingId").put(
  authMiddleware,
  authorizeRole("admin"),
  adminController.updateRepairStatus
);

router.route("/invoice").post(
  authMiddleware,
  authorizeRole("admin"),
  adminController.generateInvoice
);

router.route("/invoice/:id/verify").put(
  authMiddleware,
  authorizeRole("admin"),
  invoiceController.verifyPayment
);

export default router;
