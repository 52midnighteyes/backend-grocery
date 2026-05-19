import nodemailer from "nodemailer";
import { NODEMAILER_EMAIL, NODEMAILER_PASS } from "../../config/config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    pass: NODEMAILER_PASS,
    user: NODEMAILER_EMAIL,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  await transporter.sendMail({ to, subject, html });
};
