import { PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { DATABASE_URL } from "../../config/config.js";

const adapter = new PrismaNeon({
  connectionString: DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export const connectPrisma = async (): Promise<void> => {
  await prisma.$connect();
};

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
