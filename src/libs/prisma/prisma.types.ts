import type { PrismaClient } from "../../../generated/prisma/client.js";
import type { TransactionClient } from "../../../generated/prisma/internal/prismaNamespace.js";

export type TPrisma = PrismaClient | TransactionClient;
