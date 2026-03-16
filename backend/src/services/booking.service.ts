import mongoose from "mongoose";
import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateTrackingId } from "../utils/generateTrackingId";

export const createBookingService = async (
  userId: string,
  deviceType: string,
  deviceModel: string,
  issueDescription: string
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

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
