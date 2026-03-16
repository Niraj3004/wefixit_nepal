import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service";
import { STATUS_CODES } from "../constants/statuscode";
import { IExtendRequest } from "../middlewares/auth.middleware";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";

export const createBooking = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const { deviceType, deviceModel, issueDescription } = req.body;
  
  // AuthMiddleware ensures this is populated
  const userId = req.user?._id.toString() as string;

  const booking = await bookingService.createBookingService(
    userId,
    deviceType,
    deviceModel,
    issueDescription
  );

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

export const getMyBookings = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  // AuthMiddleware ensures this is populated
  const userId = req.user?._id.toString() as string;

  const bookings = await bookingService.getMyBookingsService(userId);

  res.status(STATUS_CODES.OK).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});
