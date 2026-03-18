import mongoose from "mongoose";
import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import User from "../models/user.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateTrackingId } from "../utils/generateTrackingId";
import { sendEmail } from "../utils/sendEmail";
import { emailTemplates } from "../utils/emailTemplates";
import { getIO } from "../server";

export const createBookingService = async (
  userId: string,
  deviceType: string,
  deviceModel: string,
  issueDescription: string,
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
          currentStatus: REPAIR_STATUS.PENDING_DROP_OFF,
        },
      ],
      { session },
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
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    //scoket.io
    const io = getIO();
    io.to(userId).emit("bookingCreated", {
      booking,
      message: "Booking created successfully",
    });

    // Send confirmation email asynchronously
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        const emailHtml = emailTemplates.bookingCreatedEmail(
          user.firstName || "Client",
          trackingId,
          `${deviceType} - ${deviceModel}`,
        );
        sendEmail(
          user.email,
          "Repair Booking Confirmed - WeFixIt",
          emailHtml,
        ).catch((err: any) =>
          console.error("Failed to send booking confirmation email:", err),
        );
      }
    } catch (err) {
      console.error("Failed to fetch user for email confirmation: ", err);
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
