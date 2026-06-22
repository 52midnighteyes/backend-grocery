import { TPrisma } from "../../libs/prisma/prisma.types.js";
import { TAdminOrderScope } from "./adminOrder.helper.js";
import { TAdminGetOrderQuerySchema } from "./adminOrder.schemas.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";

export const findAdminTransactions = async (
    query: TAdminGetOrderQuerySchema,
    scope: TAdminOrderScope,
    db: TPrisma = prisma,
) => {
    const { page, limit, storeId, status, startDate, endDate, search } = query;
    const skip = (page - 1) * limit;

    // storeAdmin hanya bisa lihat toko miliknya sendiri.
    // superAdmin bisa filter by storeId dari query, atau lihat semua jika tidak ada filter.
    const effectiveStoreId = scope.storeId ?? storeId;

    const where: Record<string, unknown> = { deletedAt: null };

    if (effectiveStoreId) where.storeId = effectiveStoreId;
    if (status) where.transactionStatus = status;
    if (search) where.id = { contains: search, mode: "insensitive" };
    if (startDate || endDate) {
        where.createdAt = {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte : new Date(endDate) } : {}),
        };
    }

    const [data, total] = await Promise.all([
        db.transaction.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    where: { deletedAt: null },
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { deletedAt: null },
                                    orderBy: { position: "asc" },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                store: true,
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
        db.transaction.count({ where }),
    ]);

    return { data, total };
};

export const findAdminTransactionById = async (
    transactionId: string,
    db: TPrisma = prisma,
) => {
    return db.transaction.findFirst({
        where: { id: transactionId, deletedAt: null },
        include: {
            items: {
                where: { deletedAt: null },
                include: {
                    product: {
                        include: {
                            images: {
                                where: { deletedAt: null },
                                orderBy: { position: "asc" },
                                take: 1,
                            },
                        },
                    },
                    discount: true,
                },
            },
            store: true,
            customer: {
                select: { id: true, name: true, email: true },
            },
            voucher: true,
            deliveryVoucher: true,
        },
    });
};