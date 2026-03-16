import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"WeFixIt Nepal" <${ENV.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email. Please try again later.");
  }
};
