import cron from "node-cron";
import { prisma } from "../libs/prisma/prisma.lib.js";
import {
  findExpiredOrders,
  updateTransactionStatus,
} from "../modules/order/order.repository.js";
import { sendOrderAutoCancelledEmail } from "../modules/order/order.mailer.js";
import { createStockHistory, findStoreStockByProductId, updateStoreStockQuantity } from "../modules/stock/stock.repository.js";

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
            // Skip fulfillment items — stok toko terdekat tidak pernah di-decrement
            // untuk item ini saat order dibuat, jadi tidak perlu di-restore.
            if (item.requiresFulfillment) continue;

            const stock = await findStoreStockByProductId(order.storeId, item.productId, tx);
            if (!stock) continue;

            const stockBefore = stock.stock;
            const stockAfter = stockBefore + item.quantity;

            await updateStoreStockQuantity(stock.id, stockAfter, tx);  
            await createStockHistory(
              {
                name: `Auto Cancelled - ${item.name}`,
                quantity: item.quantity,
                stockBefore,
                stockAfter,
                product: { connect: { id: item.productId } },
                store: { connect: { id: order.storeId } },
                transaction: { connect: { id: order.id } },
                type: "returnIn",
                notes: "Order auto-cancelled due to payment timeout",
              },
              tx,
            );
          }
        });

        sendOrderAutoCancelledEmail({
          email: order.customer.email,
          name: order.customer.name,
          orderId: order.id,
        }).catch(console.error);

        console.log(`[AutoCancel] Order ${order.id} cancelled successfully`);
      }
    } catch (error) {
      console.error("[AutoCancel] Error processing expired orders:", error);
    }
  });

  console.log("[AutoCancel] Auto cancel order job started");
};