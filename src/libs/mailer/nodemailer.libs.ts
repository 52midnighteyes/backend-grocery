import nodemailer from "nodemailer";
import { NODEMAILER_PASS, NODEMAILER_USER } from "../../config/config.js";

type TEmailCategory =
  | "EMAIL_VERIFICATION"
  | "INVOICE"
  | "TEST_MAILTRAP"
  | "ORDER_NOTIFICATION"
  | "ADMIN_NOTIFICATION";

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
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
