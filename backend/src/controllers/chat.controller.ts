import { Request, Response } from "express";
import Message from "../models/message.model";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = (req as any).user.id; // From authMiddleware

    if (!partnerId) {
      res.status(400).json({ error: "Partner ID is required" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 }) // Chronological order
      .populate("senderId", "firstName lastName email role")
      .populate("receiverId", "firstName lastName email role");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};
