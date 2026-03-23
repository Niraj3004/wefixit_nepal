import express, { Router } from "express";
import * as invoiceController from "../controllers/invoice.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { upload } from "../utils/multer";

const router: Router = express.Router();

// User uploads QR payment proof
router.route("/:id/upload-payment").post(
  AuthMiddleware.isAuthenticated,
  upload.single("receipt"),
  invoiceController.uploadPaymentProof
);

export default router;
