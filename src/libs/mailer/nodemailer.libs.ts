import nodemailer from "nodemailer";
import { NODEMAILER_USER, NODEMAILER_PASS } from "../../config/config.js";

type TEmailCategory = "EMAIL_VERIFICATION" | "INVOICE" | "TEST_MAILTRAP" | "ORDER_NOTIFICATION";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

const sender = {
  address: "grocergo@alwistudio.com",
  name: "grocergo",
};

export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  _category: TEmailCategory
): Promise<void> => {
  await transporter.sendMail({
    from: `${sender.name} <${sender.address}>`,
    to,
    subject,
    html,
  });
};