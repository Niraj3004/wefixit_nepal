import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { STATUS_CODES } from "../constants/statuscode";
import { MESSAGES } from "../constants/messages";

export const register = async (req: Request, res: Response) => {
  const user = await authService.registerClientService(req.body);

  res
    .status(STATUS_CODES.CREATED)
    .json({ message: MESSAGES.REGISTER_SUCCESS, user });
};

export const verifyOtp = async (req: Request, res: Response) => {
  await authService.verifyOtpService(req.body.email, req.body.otp, req.body.password);

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.ACCOUNT_VERIFIED });
};

export const login = async (req: Request, res: Response) => {
  const data = await authService.loginService(
    req.body.email,
    req.body.password,
  );

  res.status(STATUS_CODES.OK).json(data);
};

export const forgotPassword = async (req: Request, res: Response) => {
  await authService.forgotPasswordService(req.body.email);

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP_SENT });
};

export const resetPassword = async (req: Request, res: Response) => {
  await authService.resetPasswordService(
    req.body.email,
    req.body.otp,
    req.body.newPassword,
  );

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.PASSWORD_RESET });
};
