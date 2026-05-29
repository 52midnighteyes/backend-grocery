import { prisma } from "../src/libs/prisma/prisma.lib.js";

const main = async () => {
  const roles = ["superAdmin", "storeAdmin", "user"];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Roles seeded successfully");
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
