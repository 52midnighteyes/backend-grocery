import midtransClient from "midtrans-client";
import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION,
  FRONTEND_URL,
} from "../../config/config.js";

// --------------------------------------------------------
// MIDTRANS
// --------------------------------------------------------

const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION === "true",
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

type TMidtransItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type TCreateMidtransTransaction = {
  orderId: string;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  items: TMidtransItem[];
};

export const createMidtransTransaction = async (
  params: TCreateMidtransTransaction,
): Promise<string> => {
  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.totalPrice,
    },
    item_details: params.items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
    // Finish URL per-transaksi supaya redirect setelah bayar atau close
    // langsung ke halaman order detail, bukan ke example.com.
    // Midtrans akan append ?order_id=...&status_code=...&transaction_status=...
    callbacks: {
      finish: `${FRONTEND_URL}/orders/${params.orderId}`,
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return transaction.token;
};