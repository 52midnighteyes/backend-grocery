import {
  ProductCreateInput,
  ProductImageCreateManyInput,
  ProductStockCreateManyInput,
  ProductUpdateInput,
  ProductWhereInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import type {
  TAdminProductScope,
  TProductImagePosition,
} from "./adminProduct.models.js";

export const findProductByName = async (
  name: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      name,
      deletedAt: null,
    },
  });
};

export const findProductByNameExceptId = async (
  name: string,
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      name,
      id: {
        not: id,
      },
      deletedAt: null,
    },
  });
};

export const findProductBySku = async (
  sku: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      sku,
      deletedAt: null,
    },
  });
};

export const findProductBySkuExceptId = async (
  sku: string,
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: {
      sku,
      id: {
        not: id,
      },
      deletedAt: null,
    },
  });
};

export const findCategoryById = async (
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const createProduct = async (
  data: ProductCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.product.create({
    data,
    include: {
      category: true,
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });
};

export const findActiveStoreIds = async (db: TPrisma = prisma) => {
  return await db.store.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });
};

export const createProductStocks = async (
  data: ProductStockCreateManyInput[],
  db: TPrisma = prisma,
) => {
  if (!data.length) return { count: 0 };

  return await db.productStock.createMany({
    data,
  });
};

export const updateProduct = async (
  id: string,
  data: ProductUpdateInput,
  db: TPrisma = prisma,
) => {
  return await db.product.update({
    where: {
      id,
    },
    data,
    include: {
      category: true,
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });
};

export const updateProductImagePosition = async (
  image: TProductImagePosition,
  db: TPrisma = prisma,
) => {
  return await db.productImage.update({
    where: {
      id: image.id,
    },
    data: {
      position: image.position,
    },
  });
};

export const createProductImages = async (
  productId: string,
  images: Omit<ProductImageCreateManyInput, "productId">[],
  db: TPrisma = prisma,
) => {
  if (!images.length) return { count: 0 };

  return await db.productImage.createMany({
    data: images.map((image) => ({
      ...image,
      productId,
    })),
  });
};

export const softDeleteProductImagesByIds = async (
  productId: string,
  imageIds: string[],
  db: TPrisma = prisma,
) => {
  if (!imageIds.length) return { count: 0 };

  return await db.productImage.updateMany({
    where: {
      productId,
      id: {
        in: imageIds,
      },
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const softDeleteProductImage = async (
  productId: string,
  imageId: string,
  db: TPrisma = prisma,
) => {
  return await db.productImage.updateMany({
    where: {
      productId,
      id: imageId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

const buildAdminProductWhere = (
  slug: string,
  scope: TAdminProductScope = {},
): ProductWhereInput => {
  return {
    slug,
    deletedAt: null,
    ...(scope.storeId
      ? {
          stocks: {
            some: {
              storeId: scope.storeId,
              deletedAt: null,
              store: {
                deletedAt: null,
              },
            },
          },
        }
      : {}),
  };
};

export const findAdminProductBySlug = async (
  slug: string,
  scope: TAdminProductScope = {},
  db: TPrisma = prisma,
) => {
  return await db.product.findFirst({
    where: buildAdminProductWhere(slug, scope),
    include: {
      category: true,
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: "asc",
        },
      },
      stocks: {
        where: {
          deletedAt: null,
          ...(scope.storeId ? { storeId: scope.storeId } : {}),
          store: {
            deletedAt: null,
          },
        },
        include: {
          store: true,
        },
        orderBy: {
          store: {
            name: "asc",
          },
        },
      },
      stockHistories: {
        where: {
          deletedAt: null,
          ...(scope.storeId ? { storeId: scope.storeId } : {}),
        },
        include: {
          store: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      discounts: {
        where: {
          deletedAt: null,
          ...(scope.storeId ? { storeId: scope.storeId } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

export const softDeleteProduct = async (
  id: string,
  db: TPrisma = prisma,
) => {
  return await db.product.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const softDeleteProductStocks = async (
  productId: string,
  db: TPrisma = prisma,
) => {
  return await db.productStock.updateMany({
    where: {
      productId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const softDeleteProductImages = async (
  productId: string,
  db: TPrisma = prisma,
) => {
  return await db.productImage.updateMany({
    where: {
      productId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
