import express, { Router } from "express";
import * as userController from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

// Retrieve currently logged-in user's profile
router.route("/me").get(AuthMiddleware.isAuthenticated, userController.getMe);

// Update basic user profile details (name, phone, address)
router.route("/me").put(AuthMiddleware.isAuthenticated, userController.updateMe);

// Change user password explicitly when logged in
router.route("/change-password").put(AuthMiddleware.isAuthenticated, userController.changePassword);

export default router;
