import cron from "node-cron";
import { prisma } from "../libs/prisma/prisma.lib.js";
import {
  findExpiredOrders,
  updateTransactionStatus,
  incrementProductStock,
  createStockHistory,
} from "../modules/order/order.repository.js";

// Cron job auto cancel order yang sudah melewati batas waktu pembayaran (1 jam).
// Dijalan setiap menit untuk memastikan tidak ada order expired yang terlambat dicancel.
export const startAutoCancelOrderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const expiredOrders = await findExpiredOrders();

      if (expiredOrders.length === 0) return;

      console.log(`[AutoCancel] Found ${expiredOrders.length} expired order(s), processing...`);

      for (const order of expiredOrders) {
        await prisma.$transaction(async (tx) => {
          await updateTransactionStatus(order.id, "cancel", tx);

          for (const item of order.items) {
            await incrementProductStock(item.productId, order.storeId, item.quantity, tx);
            await createStockHistory(
              {
                name: `Pembatalan Otomatis - ${item.name}`,
                productId: item.productId,
                storeId: order.storeId,
                type: "returnOut",
                transactionId: order.id,
                quantity: item.quantity,
              },
              tx,
            );
          }
        });

        console.log(`[AutoCancel] Order ${order.id} cancelled successfully`);
      }
    } catch (error) {
      console.error("[AutoCancel] Error processing expired orders:", error);
    }
  });

  console.log("[AutoCancel] Auto cancel order job started");
};