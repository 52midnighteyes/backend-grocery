import { prisma, disconnectPrisma } from "../src/libs/prisma/prisma.lib.js";

const categories = [
  "Fruits",
  "Vegetables",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Beverages",
  "Snacks",
  "Frozen Foods",
  "Pantry Staples",
  "Personal Care",
];

const seedCategories = async () => {
  const seededCategories = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  console.log(`Seeded ${seededCategories.length} categories:`);
  seededCategories.forEach((category) => {
    console.log(`${category.id} - ${category.name}`);
  });
};

seedCategories()
  .catch((error) => {
    console.error("Failed to seed categories:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
