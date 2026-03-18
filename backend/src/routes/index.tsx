import express, { Router } from "express";
const router: Router = express.Router();
import authRouther from "./auth.route";
import bookingRouter from "./booking.route";
import trackingRouter from "./tracking.route";

router.use("/auth", authRouther);
router.use("/booking", bookingRouter);
router.use("/tracking", trackingRouter);

export default router;
