import { prisma } from "../src/libs/prisma/prisma.lib.js";
import argon2 from "argon2";

const main = async () => {
  const roles = ["superAdmin", "storeAdmin", "user"];
  const permissions = [
    { name: "admin:login", description: "Allow admin dashboard login" },
    { name: "product:read", description: "Allow reading admin product data" },
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Roles seeded successfully");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
        deletedAt: null,
      },
      create: permission,
    });
  }

  const adminRoleNames = ["superAdmin", "storeAdmin"];

  for (const roleName of adminRoleNames) {
    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) throw new Error(`${roleName} role not found`);

    for (const permission of permissions) {
      const permissionRecord = await prisma.permission.findFirst({
        where: { name: permission.name },
      });
      if (!permissionRecord) {
        throw new Error(`${permission.name} permission not found`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {
          deletedAt: null,
        },
        create: {
          roleId: role.id,
          permissionId: permissionRecord.id,
        },
      });
    }
  }

  console.log("Permissions seeded successfully");

  const superAdminRole = await prisma.role.findFirst({
    where: { name: "superAdmin" },
  });
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
