import nodemailer from "nodemailer";
import { MailtrapClient, MailtrapTransport } from "mailtrap";
import { MAILTRAP_TOKEN } from "../../config/config.js";

type TEmailCategory = "EMAIL_VERIFICATION" | "INVOICE" | "TEST_MAILTRAP";

const transporter = nodemailer.createTransport(
  MailtrapTransport({ token: MAILTRAP_TOKEN })
);

const sender = {
  address: "grocergo@alwistudio.com",
  name: "grocergo",
};
export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  category: TEmailCategory
): Promise<void> => {
  transporter.sendMail({
    from: sender,
    to,
    subject,
    html,
    category,
  });
};
