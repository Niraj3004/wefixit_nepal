import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import User from "../models/user.model";
import { sendEmail } from "../utils/sendEmail";
import { emailTemplates } from "../utils/emailTemplates";

export const getTrackingTimelineService = async (trackingId: string) => {
  const booking = await Booking.findOne({ trackingId });

  if (!booking) {
    throw new Error("Tracking information not found");
  }

  const timeline = await RepairStatus.find({ bookingId: booking._id })
    .sort({ createdAt: -1 })
    .populate("updatedBy", "firstName lastName email role");

  return {
    booking,
    timeline,
  };
};

export const updateTrackingStatusService = async (
  bookingId: string,
  status: string,
  notes: string,
  userId: string,
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Update main booking status
  booking.currentStatus = status;
  await booking.save();

  // Create timeline entry
  const newStatus = await RepairStatus.create({
    bookingId,
    status,
    notes,
    updatedBy: userId,
  });

  // Fetch the user to get their email
  const user = await User.findById(booking.user);

  if (user && user.email) {
    const emailHtml = emailTemplates.statusUpdateEmail(
      user.firstName || "Client",
      booking.trackingId,
      status,
      notes,
    );

    // Send email asynchronously without blocking the response
    sendEmail(user.email, "Repair Status Update - WeFixIt", emailHtml).catch(
      (err: any) => console.error("Failed to send status update email:", err),
    );
  }

  return newStatus;
};
