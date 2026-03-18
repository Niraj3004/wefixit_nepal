import express, { Router } from "express";
import * as trackingController from "../controllers/tracking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { validateZod } from "../middlewares/validationzod";
import {
  getTrackingSchema,
  updateStatusSchema,
} from "../validations/tracking.validation";
import { ROLES } from "../constants/role";

const router: Router = express.Router();

// PUBLIC: Clients can track their repair
// validate() ensures trackingId is the right length before hitting the DB

router
  .route("/:trackingId")
  .get(validateZod(getTrackingSchema), trackingController.getTrackingStatus);

router
  .route("/:bookingId/status")
  .patch(
    AuthMiddleware.isAuthenticated,
    AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.TECHNICIAN),
    validateZod(updateStatusSchema),
    trackingController.updateStatus,
  );

export default router;
