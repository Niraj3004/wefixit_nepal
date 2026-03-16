import { Router } from "express";
import * as trackingController from "../controllers/tracking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { validateZod } from "../middlewares/validationzod";
import {
  getTrackingSchema,
  updateStatusSchema,
} from "../validations/tracking.validation";
import { ROLES } from "../constants/role";

const router = Router();

// PUBLIC: Clients can track their repair
// validate() ensures trackingId is the right length before hitting the DB
router.get(
  "/:trackingId",
  validateZod(getTrackingSchema),
  trackingController.getTrackingStatus,
);

// PROTECTED: Only Admins/Technicians can update repair status
router.put(
  "/:bookingId/status",
  AuthMiddleware.isAuthenticated,
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.TECHNICIAN),
  validateZod(updateStatusSchema), // Ensures payload has 'status'
  trackingController.updateStatus,
);

export default router;
