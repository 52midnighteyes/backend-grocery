import { Resend } from "resend";
import { RESEND_API_KEY } from "../../config/config.js";

type TEmailCategory =
  | "EMAIL_VERIFICATION"
  | "INVOICE"
  | "TEST_MAILTRAP"
  | "ORDER_NOTIFICATION"
  | "ADMIN_NOTIFICATION";

const resend = new Resend(RESEND_API_KEY);

const sender = {
  address: "grocergo@grivilabs.my.id",
  name: "grocergo",
};

export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  _category: TEmailCategory
): Promise<void> => {
  await resend.emails.send({
    from: `${sender.name} <${sender.address}>`,
    to,
    subject,
    html,
  });
};