import nodemailer from "nodemailer";
import { NODEMAILER_USER, NODEMAILER_PASS } from "../../config/config.js";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  await transporter.sendMail({ to, subject, html });
};
