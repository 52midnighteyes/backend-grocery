import cron from "node-cron";
import { prisma } from "../libs/prisma/prisma.lib.js";
import {
  updateTransactionStatus,
} from "../modules/order/order.repository.js";

// Cron job auto confirm order yang sudah 2x24 jam dalam status onDelivery
// tanpa konfirmasi dari user. Dijalankan setiap jam sekali.
export const startAutoConfirmOrderJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      const ordersToConfirm = await prisma.transaction.findMany({
        where: {
          transactionStatus: "onDelivery",
          updatedAt: { lte: twoDaysAgo },
          deletedAt: null,
        },
      });

      if (ordersToConfirm.length === 0) return;

      console.log(`[AutoConfirm] Found ${ordersToConfirm.length} order(s) to confirm, processing...`);

      for (const order of ordersToConfirm) {
        await updateTransactionStatus(order.id, "confirmed");
        console.log(`[AutoConfirm] Order ${order.id} confirmed successfully`);
      }
    } catch (error) {
      console.error("[AutoConfirm] Error processing orders:", error);
    }
  });

  console.log("[AutoConfirm] Auto confirm order job started");
};