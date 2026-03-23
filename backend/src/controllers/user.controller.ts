import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const getMe = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized access to user profile");

  const user = await userService.getUserProfileService(userId);
  res.status(STATUS_CODES.OK).json({ success: true, data: user });
});

export const updateMe = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized access to user profile");

  const { firstName, lastName, phone, currentAddress } = req.body;
  const updatedUser = await userService.updateUserProfileService(userId, {
    firstName,
    lastName,
    phone,
    currentAddress
  });

  res.status(STATUS_CODES.OK).json({ success: true, data: updatedUser });
});

export const changePassword = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized access to user profile");

  const { oldPassword, newPassword } = req.body;
  const result = await userService.changePasswordService(userId, oldPassword, newPassword);

  res.status(STATUS_CODES.OK).json({ success: true, message: result.message });
});
