import nodemailer from "nodemailer";
import { MAILTRAP_USER, MAILTRAP_PASS } from "../../config/config.js";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  await transport.sendMail({ to, subject, html });
};
