import { ProductCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../libs/prisma/prisma.lib.js";
import { TPrisma } from "../libs/prisma/prisma.types.js";

export const findProductById = async (id: string, db: TPrisma = prisma) => {
  return await db.product.findUnique({
    where: { id },
  });
};

export const findProductByName = async (name: string, db: TPrisma = prisma) => {
  return await db.product.findUnique({
    where: { name },
  });
};

export const createProductRepo = async (
  params: ProductCreateInput,
  db: TPrisma = prisma
) => {
  return await db.product.create({
    data: params,
  });
};

export const uploadManyProductImageRepo = async (
  file: { secureUrl: string; publicId: string }[],
  productId: string,
  db: TPrisma = prisma
) => {
  return await db.productImage.createMany({
    data: file.map((image, index) => ({
      productId: productId,
      image: image.secureUrl,
      publicId: image.publicId,
      position: index + 1,
    })),
  });
};

export const getProductAndImagesRepo = async (
  id: string,
  db: TPrisma = prisma
) => {
  return await db.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
};
