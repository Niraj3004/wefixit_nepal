import { Request, Response, NextFunction } from "express";
import * as chatbotAIService from "../services/chatbotAI.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";

export const handleChatQuery = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  if (!message) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Message is required" });
  }

  const response = await chatbotAIService.processQueryService(message);
  res.status(STATUS_CODES.OK).json({ success: true, data: response });
});
