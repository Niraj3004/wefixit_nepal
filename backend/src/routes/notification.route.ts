import express, { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.route("/")
  .get(AuthMiddleware.isAuthenticated, notificationController.getUserNotifications);

router.route("/:id/read")
  .put(AuthMiddleware.isAuthenticated, notificationController.markAsRead);

export default router;
