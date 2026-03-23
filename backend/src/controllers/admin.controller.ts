import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import * as bookingService from "../services/booking.service";
import * as trackingService from "../services/tracking.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const getDashboardStats = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await adminService.getDashboardStatsService();

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: stats,
  });
});

export const getAllUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const users = await adminService.getAllUsersService();
  res.status(STATUS_CODES.OK).json({ success: true, count: users.length, data: users });
});

export const deleteUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await adminService.deleteUserService(id);
  res.status(STATUS_CODES.OK).json({ success: true, message: "User deleted successfully" });
});

export const getAllBookings = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Proxy to the booking service
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status ? String(req.query.status) : undefined;

  const result = await bookingService.getAllBookingsService(page, limit, status);

  res.status(STATUS_CODES.OK).json({
    success: true,
    count: result.bookings.length,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
    currentPage: result.page,
    data: result.bookings,
  });
});

export const updateBookingStatus = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { status, price } = req.body;
  const updatedBooking = await adminService.updateBookingStatusService(id, status, price ? Number(price) : undefined);
  res.status(STATUS_CODES.OK).json({ success: true, data: updatedBooking });
});

export const updateRepairStatus = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const bookingId = req.params.bookingId as string;
  const { status, notes, price, isInternal } = req.body;
  const userId = req.user?._id?.toString() || req.user?.email || "System";

  // Proxy to trackingService's timeline update
  const updatedStatus = await trackingService.updateTrackingStatusService(
    bookingId,
    status as string,
    notes as string,
    userId as string,
    price ? Number(price) : undefined,
    isInternal === true
  );

  res.status(STATUS_CODES.OK).json({ success: true, data: updatedStatus });
});

export const generateInvoice = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const bookingId = req.body.bookingId as string;
  const result = await adminService.generateInvoiceService(bookingId);
  res.status(STATUS_CODES.OK).json({ success: true, message: result.message });
});
