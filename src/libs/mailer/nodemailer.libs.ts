import nodemailer from "nodemailer";
import {
  NODEMAILER_HOST,
  NODEMAILER_PASS,
  NODEMAILER_USER,
} from "../../config/config.js";

type TEmailCategory =
  | "EMAIL_VERIFICATION"
  | "INVOICE"
  | "TEST_MAILTRAP"
  | "ORDER_NOTIFICATION"
  | "ADMIN_NOTIFICATION";

const mailHost = NODEMAILER_HOST?.toLowerCase();

export const transporter = nodemailer.createTransport(
  mailHost === "gmail"
    ? {
        service: "gmail",
        auth: {
          user: NODEMAILER_USER,
          pass: NODEMAILER_PASS,
        },
      }
    : {
        host: NODEMAILER_HOST,
        port: 587,
        secure: false,
        auth: {
          user: NODEMAILER_USER,
          pass: NODEMAILER_PASS,
        },
      }
);

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
