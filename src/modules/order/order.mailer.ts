import { compileHandlebars } from "../../helper/handlebars.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { FRONTEND_URL } from "../../config/config.js";

const formatCurrency = (amount: number) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(amount);

const formatDate = (date: Date) =>
  date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

export const sendOrderCreatedEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
  totalPrice: number;
  paymentExpiredAt: Date;
  shippingVendor: string;
  deliveryFee: number;
  items: { name: string; quantity: number; totalPrice: number }[];
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "order-created.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    totalPrice: formatCurrency(params.totalPrice),
    paymentExpiredAt: formatDate(params.paymentExpiredAt),
    shippingVendor: params.shippingVendor,
    deliveryFee: formatCurrency(params.deliveryFee),
    items: params.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      totalPrice: formatCurrency(item.totalPrice),
    })),
    orderUrl: `${FRONTEND_URL}/orders/${params.orderId}`,
  });
  await sendMail(params.email, "Pesanan Berhasil Dibuat - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendPaymentRejectedEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "payment-rejected.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    orderUrl: `${FRONTEND_URL}/orders/${params.orderId}`,
  });
  await sendMail(params.email, "Bukti Pembayaran Ditolak - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendPaymentConfirmedEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "payment-confirmed.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    orderUrl: `${FRONTEND_URL}/orders/${params.orderId}`,
  });
  await sendMail(params.email, "Pembayaran Dikonfirmasi - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendOrderShippedEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
  shippingVendor: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "order-shipped.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    shippingVendor: params.shippingVendor,
    orderUrl: `${FRONTEND_URL}/orders/${params.orderId}`,
  });
  await sendMail(params.email, "Pesanan Sedang Dikirim - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendOrderAutoCancelledEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "order-auto-cancelled.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    shopUrl: FRONTEND_URL,
  });
  await sendMail(params.email, "Pesanan Dibatalkan Otomatis - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendOrderAdminCancelledEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "order-admin-cancelled.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    shopUrl: FRONTEND_URL,
  });
  await sendMail(params.email, "Pesanan Dibatalkan - GrocerGo", html, "ORDER_NOTIFICATION");
};

export const sendOrderMidtransCancelledEmail = async (params: {
  email: string;
  name: string;
  orderId: string;
}) => {
  const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "order-midtrans-cancelled.mail.hbs", {
    name: params.name,
    orderId: params.orderId.slice(0, 8).toUpperCase(),
    shopUrl: FRONTEND_URL,
  });
  await sendMail(params.email, "Pembayaran Gagal - GrocerGo", html, "ORDER_NOTIFICATION");
};