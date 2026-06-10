import { prisma } from "../src/libs/prisma/prisma.lib.js";

// ---------------------------------------------------------------------------
// Seed data for testing the Homepage feature (location-based product list).
// Re-runnable: everything is upserted by a unique field, so running it twice
// will not create duplicates and will NOT delete teammates' data on the shared
// Neon database. Coordinates are real city centers in Indonesia.
// ---------------------------------------------------------------------------

const stores = [
  { name: "GrocerGo Jakarta", latitude: "-6.175392", longitude: "106.827153", isMain: true },
  { name: "GrocerGo Bandung", latitude: "-6.914744", longitude: "107.609810" },
  { name: "GrocerGo Surabaya", latitude: "-7.257472", longitude: "112.752090" },
  { name: "GrocerGo Denpasar", latitude: "-8.670458", longitude: "115.212629" },
  { name: "GrocerGo Medan", latitude: "3.595196", longitude: "98.672226" },
];

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Beverages",
  "Snacks",
  "Bakery",
];

// `stock` is the quantity placed in EVERY store. One item is intentionally 0 to
// prove the homepage's inStock filter hides out-of-stock products.
const products = [
  { name: "Cavendish Bananas", category: "Fruits & Vegetables", brand: "Sunpride", size: "1 kg", price: 28000, sku: "FV-BAN-001", stock: 80 },
  { name: "Red Fuji Apples", category: "Fruits & Vegetables", brand: "Fresh Pick", size: "1 kg", price: 45000, sku: "FV-APP-002", stock: 60 },
  { name: "Fresh Carrots", category: "Fruits & Vegetables", brand: "Fresh Pick", size: "500 g", price: 15000, sku: "FV-CAR-003", stock: 100 },
  { name: "Baby Spinach", category: "Fruits & Vegetables", brand: "Fresh Pick", size: "250 g", price: 18000, sku: "FV-SPI-004", stock: 40 },
  { name: "Fresh Milk", category: "Dairy & Eggs", brand: "Greenfields", variant: "Full Cream", size: "1 L", price: 22000, sku: "DE-MLK-005", stock: 70 },
  { name: "Free-Range Eggs", category: "Dairy & Eggs", brand: "Happy Hens", size: "10 pcs", price: 35000, sku: "DE-EGG-006", stock: 0 },
  { name: "Cheddar Cheese", category: "Dairy & Eggs", brand: "Kraft", size: "165 g", price: 38000, sku: "DE-CHE-007", stock: 30 },
  { name: "Orange Juice", category: "Beverages", brand: "Buavita", variant: "No Sugar Added", size: "1 L", price: 26000, sku: "BV-OJ-008", stock: 55 },
  { name: "Mineral Water", category: "Beverages", brand: "Aqua", size: "600 ml", price: 4000, sku: "BV-WTR-009", stock: 200 },
  { name: "Potato Chips", category: "Snacks", brand: "Lay's", variant: "Salted", size: "160 g", price: 21000, sku: "SN-CHP-010", stock: 90 },
  { name: "Dark Chocolate", category: "Snacks", brand: "Silverqueen", variant: "70% Cacao", size: "100 g", price: 24000, sku: "SN-CHO-011", stock: 65 },
  { name: "Whole Wheat Bread", category: "Bakery", brand: "Sari Roti", size: "400 g", price: 19000, sku: "BK-BRD-012", stock: 45 },
];

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function seedStores() {
  const records: Record<string, string> = {};
  // Ensure exactly one main store: clear the flag everywhere, then set ours.
  await prisma.store.updateMany({ data: { isMain: false } });
  for (const store of stores) {
    const saved = await prisma.store.upsert({
      where: { name: store.name },
      update: { latitude: store.latitude, longitude: store.longitude, isMain: store.isMain ?? false },
      create: { name: store.name, latitude: store.latitude, longitude: store.longitude, isMain: store.isMain ?? false },
    });
    records[store.name] = saved.id;
  }
  return records;
}

async function seedCategories() {
  const records: Record<string, string> = {};
  for (const name of categories) {
    const saved = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    records[name] = saved.id;
  }
  return records;
}

async function seedProducts(
  storeIds: Record<string, string>,
  categoryIds: Record<string, string>
) {
  for (const product of products) {
    const slug = slugify(product.name);
    const data = {
      name: product.name,
      slug,
      sku: product.sku,
      price: product.price,
      brand: product.brand ?? null,
      variant: product.variant ?? null,
      size: product.size ?? null,
      categoryId: categoryIds[product.category],
    };
    const saved = await prisma.product.upsert({
      where: { sku: product.sku },
      update: data,
      create: data,
    });

    // Reset images so re-running the seed doesn't pile up duplicates.
    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    await prisma.productImage.create({
      data: {
        productId: saved.id,
        image: `https://picsum.photos/seed/${slug}/400/400`,
        position: 1,
      },
    });

    // Same stock level in every store so the nearest store always has products.
    for (const storeId of Object.values(storeIds)) {
      await prisma.productStock.upsert({
        where: { productId_storeId: { productId: saved.id, storeId } },
        update: { stock: product.stock },
        create: { productId: saved.id, storeId, stock: product.stock },
      });
    }
  }
}

async function main() {
  const storeIds = await seedStores();
  const categoryIds = await seedCategories();
  await seedProducts(storeIds, categoryIds);
  console.log(
    `Seed complete: ${stores.length} stores, ${categories.length} categories, ${products.length} products.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
