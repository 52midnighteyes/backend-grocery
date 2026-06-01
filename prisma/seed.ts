import { prisma } from "../src/libs/prisma/prisma.lib.js";
import argon2 from "argon2";

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
  
  const superAdminRole = await prisma.role.findFirst({ where: { name: "superAdmin" } });
  if (!superAdminRole) throw new Error("superAdmin role not found");

  const hashedPassword = await argon2.hash("SuperAdmin123");

  await prisma.user.upsert({
    where: { email: "superadmin@grocergo.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@grocergo.com",
      password: hashedPassword,
      isVerified: true,
      roleId: superAdminRole.id,
    },
  });

  console.log("Super admin seeded successfully");
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
