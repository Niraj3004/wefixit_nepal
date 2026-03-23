import mongoose from "mongoose";
import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import User from "../models/user.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateTrackingId } from "../utils/generateTrackingId";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { generateInvoicePDF } from "../utils/pdfGenerator";

export const downloadInvoiceService = async (bookingId: string, userId: string) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate("user", "firstName lastName email");
  
  if (!booking) throw new Error("Booking not found or you do not have permission to access it");
  if (booking.currentStatus !== REPAIR_STATUS.COMPLETED) throw new Error("Invoice is only available for completed repairs");

  const user = booking.user as any;
  const filePath = await generateInvoicePDF({
    trackingId: booking.trackingId,
    customerName: user.firstName + " " + (user.lastName || ""),
    customerEmail: user.email,
    deviceType: booking.deviceType,
    deviceModel: booking.deviceModel,
    issueDescription: booking.issueDescription,
    price: booking.price || 0,
    date: new Date()
  });

  return filePath;
};

export const createBookingService = async (
  userId: string,
  deviceType: string,
  deviceModel: string,
  issueDescription: string,
  deviceImages: string[] = []
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate professional tracking ID
    const trackingId = generateTrackingId();

    // Create main booking
    const bookingArray = await Booking.create(
      [
        {
          user: userId,
          trackingId,
          deviceType,
          deviceModel,
          issueDescription,
          deviceImages,
          currentStatus: REPAIR_STATUS.PENDING_DROP_OFF,
        },
      ],
      { session }
    );

    const booking = bookingArray[0];

    if (!booking) {
      throw new Error("Failed to create booking.");
    }

    // Create initial timeline entry
    await RepairStatus.create(
      [
        {
          bookingId: booking._id,
          status: REPAIR_STATUS.PENDING_DROP_OFF,
          notes: "Booking created by client.",
          updatedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send confirmation email asynchronously
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        const emailHtml = emailTemplates.bookingCreatedEmail(
          user.firstName || "Client",
          trackingId,
          `${deviceType} - ${deviceModel}`
        );
        sendEmail(user.email, "Repair Booking Confirmed - WeFixIt", emailHtml).catch(
            (err: any) => console.error("Failed to send booking confirmation email:", err)
        );
      }
    } catch(err) {
      console.error("Failed to fetch user for email confirmation: ", err)
    }

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getMyBookingsService = async (userId: string) => {
  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
  return bookings;
};

export const getAllBookingsService = async (page: number = 1, limit: number = 10, status?: string) => {
  const query: any = {};
  if (status) {
    query.currentStatus = status;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate("user", "firstName lastName email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(query);

  return { bookings, total, page, limit };
};
