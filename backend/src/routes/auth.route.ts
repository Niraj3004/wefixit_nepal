import express, { Router } from "express";
import * as authController from "../controllers/auth.controller";
const router: Router = express.Router();

router.route("/register").post(authController.register);
router.route("/verify-otp").post(authController.verifyOtp);
router.route("/login").post(authController.login);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password").post(authController.resetPassword);

export default router;
