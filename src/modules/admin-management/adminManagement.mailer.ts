import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";

export const sendAdminAccountCreatedEmail = async (params: {
  email: string;
  name: string;
  password: string;
  storeName: string;
}) => {
  const html = await compileHandlebars(
    EMAIL_TEMPLATES_DIR,
    "admin-account-created.mail.hbs",
    {
      name: params.name,
      email: params.email,
      password: params.password,
      storeName: params.storeName,
    },
  );

  await sendMail(
    params.email,
    "GrocerGo Admin Account Created",
    html,
    "ADMIN_NOTIFICATION",
  );
};

export const sendAdminAccountUpdatedEmail = async (params: {
  email: string;
  name: string;
  password?: string;
  roleName: string;
  storeName: string;
}) => {
  const html = await compileHandlebars(
    EMAIL_TEMPLATES_DIR,
    "admin-account-updated.mail.hbs",
    {
      name: params.name,
      email: params.email,
      password: params.password,
      roleName: params.roleName,
      storeName: params.storeName,
      hasPassword: Boolean(params.password),
    },
  );

  await sendMail(
    params.email,
    "GrocerGo Admin Account Updated",
    html,
    "ADMIN_NOTIFICATION",
  );
};
