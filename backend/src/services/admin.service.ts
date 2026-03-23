import Booking from "../models/booking.model";
import User from "../models/user.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { Notification } from "../models/notification.model";
import fs from "fs";

export const getDashboardStatsService = async () => {
  const totalBookings = await Booking.countDocuments();

  const pendingBookings = await Booking.countDocuments({
    currentStatus: {
      $in: [REPAIR_STATUS.PENDING_DROP_OFF, REPAIR_STATUS.IN_PROGRESS],
    },
  });

  const completedBookings = await Booking.countDocuments({
    currentStatus: REPAIR_STATUS.COMPLETED,
  });

  // Calculate total revenue from completed repairs
  const revenueResult = await Booking.aggregate([
    { $match: { currentStatus: REPAIR_STATUS.COMPLETED } },
    { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
  ]);

  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const recentBookings = await Booking.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    recentBookings,
  };
};

export const getAllUsersService = async () => {
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-password")
    .sort({ createdAt: -1 });
  return users;
};

export const deleteUserService = async (userId: string) => {
  const result = await User.findByIdAndDelete(userId);
  return result;
};

export const updateBookingStatusService = async (
  bookingId: string,
  status: string,
  price?: number,
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  booking.currentStatus = status;
  if (price !== undefined) booking.price = price;

  await booking.save();
  return booking;
};

export const generateInvoiceService = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).populate(
    "user",
    "firstName lastName email",
  );
  if (!booking) throw new Error("Booking not found");

  const user = booking.user as any;
  if (!user || !user.email)
    throw new Error("User email not found for this booking");

  const attachmentPath = await generateInvoicePDF({
    trackingId: booking.trackingId,
    customerName: user.firstName + " " + (user.lastName || ""),
    customerEmail: user.email,
    deviceType: booking.deviceType,
    deviceModel: booking.deviceModel,
    issueDescription: booking.issueDescription,
    price: booking.price || 0,
    date: new Date(),
  });

  const emailHtml = emailTemplates.statusUpdateEmail(
    user.firstName || "Client",
    booking.trackingId,
    booking.currentStatus,
    "Here is your generated invoice inside the attachment.",
  );

  await sendEmail(
    user.email,
    "Your Repair Invoice - WeFixIt",
    emailHtml,
    attachmentPath,
  );

  if (attachmentPath && fs.existsSync(attachmentPath)) {
    // fs.unlinkSync(attachmentPath);
  }

  return { message: "Invoice generated and sent to customer successfully" };
};

export const sendCustomNotificationService = async (
  userId: string,
  title: string,
  message: string,
  type: string = "ALERT"
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    isRead: false,
  });

  if (user.email) {
    const emailHtml = emailTemplates.customAnnouncementEmail(
      user.firstName || "Client",
      title,
      message
    );

    sendEmail(user.email, title, emailHtml).catch(err => {
      console.error("Failed to send custom notification email", err);
    });
  }

  return notification;
};
