import { AppError } from "../../class/appError.js";
import {
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from "../../../generated/prisma/models.js";
import {
  cloudinaryDelete,
  cloudinaryUpload,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { findUserById } from "../user/user.repository.js";
import type {
  TAdminProductScope,
  TProductGalleryImage,
  TProductImagePosition,
  TProductImageUploadFiles,
  TUploadedProductImage,
} from "./adminProduct.models.js";
import type { TGetAdminProductsQuery } from "./adminProduct.schemas.js";

type TAdminProductStockWhere = NonNullable<
  ProductWhereInput["stocks"]
>["some"];

const buildAdminProductStockWhere = (query: TGetAdminProductsQuery) => {
  const where: TAdminProductStockWhere = {
    deletedAt: null,
  };

  if (query.storeId) where.storeId = query.storeId;

  const stockFilter: { gte?: number; lte?: number; gt?: number } = {};
  if (query.minStock !== undefined) stockFilter.gte = query.minStock;
  if (query.maxStock !== undefined) stockFilter.lte = query.maxStock;
  if (query.inStock === true) stockFilter.gt = 0;
  if (query.inStock === false) stockFilter.lte = 0;
  if (Object.keys(stockFilter).length) where.stock = stockFilter;

  return where;
};

export const buildAdminProductListWhere = (
  query: TGetAdminProductsQuery,
): ProductWhereInput => {
  const where: ProductWhereInput = {
    deletedAt: null,
  };

  const andConditions: ProductWhereInput[] = [];

  if (query.q) {
    andConditions.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
        { sku: { contains: query.q, mode: "insensitive" } },
        { brand: { contains: query.q, mode: "insensitive" } },
        { variant: { contains: query.q, mode: "insensitive" } },
        { size: { contains: query.q, mode: "insensitive" } },
        { category: { name: { contains: query.q, mode: "insensitive" } } },
      ],
    });
  }

  if (query.name) {
    andConditions.push({
      name: { contains: query.name, mode: "insensitive" },
    });
  }

  if (query.slug) {
    andConditions.push({
      slug: { contains: query.slug, mode: "insensitive" },
    });
  }

  if (query.sku) {
    andConditions.push({
      sku: { contains: query.sku, mode: "insensitive" },
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: { contains: query.brand, mode: "insensitive" },
    });
  }

  if (query.variant) {
    andConditions.push({
      variant: { contains: query.variant, mode: "insensitive" },
    });
  }

  if (query.size) {
    andConditions.push({
      size: { contains: query.size, mode: "insensitive" },
    });
  }

  if (query.categoryName) {
    andConditions.push({
      category: { name: { contains: query.categoryName, mode: "insensitive" } },
    });
  }

  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    andConditions.push({
      price: {
        gte: query.minPrice,
        lte: query.maxPrice,
      },
    });
  }

  if (
    query.storeId ||
    query.minStock !== undefined ||
    query.maxStock !== undefined ||
    typeof query.inStock === "boolean"
  ) {
    andConditions.push({
      stocks: {
        some: buildAdminProductStockWhere(query),
      },
    });
  }

  if (andConditions.length) where.AND = andConditions;

  return where;
};

export const buildAdminProductListOrderBy = (
  query: TGetAdminProductsQuery,
): ProductOrderByWithRelationInput => {
  if (query.sortBy === "categoryName") {
    return { category: { name: query.sortOrder } };
  }

  return { [query.sortBy]: query.sortOrder };
};

export const cleanupUploadedProductImages = async (publicIds: string[]) => {
  await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        await cloudinaryDelete(publicId);
      } catch (error) {
        console.error(
          "Failed to cleanup uploaded product image:",
          publicId,
          error,
        );
      }
    }),
  );
};

export const deleteProductImagesFromCloudinary = async (
  publicIds: string[],
) => {
  if (!publicIds.length) return;

  await Promise.all(publicIds.map((publicId) => cloudinaryDelete(publicId)));
};

export const getAdminProductScope = async (
  requesterId: string,
): Promise<TAdminProductScope> => {
  const requester = await findUserById(requesterId);
  if (!requester) throw new AppError(401, "Unauthorized");

  if (requester.role.name === "superAdmin") return {};

  if (requester.storeId) {
    return { storeId: requester.storeId };
  }

  if (requester.role.name === "storeAdmin") {
    throw new AppError(403, "Store admin is not assigned to a store");
  }

  return {};
};

export const assertProductImagePayload = (
  files: TProductImageUploadFiles,
  positions: number[],
) => {
  if (!files.length) {
    throw new AppError(400, "At least one product image is required");
  }

  if (files.length > 5) {
    throw new AppError(400, "Product images cannot be more than 5");
  }

  if (positions.length !== files.length) {
    throw new AppError(400, "Image positions must match uploaded image count");
  }

  assertUniqueProductImagePositions(positions);
};

export const assertUniqueProductImagePositions = (positions: number[]) => {
  if (new Set(positions).size !== positions.length) {
    throw new AppError(400, "Product image positions must be unique");
  }
};

export const assertProductGalleryPayload = (
  existingImages: TProductImagePosition[],
  files: TProductImageUploadFiles,
  newImagePositions: number[],
  activeImages: TProductGalleryImage[],
) => {
  if (newImagePositions.length !== files.length) {
    throw new AppError(400, "New image positions must match uploaded image count");
  }

  const finalImageCount = existingImages.length + files.length;
  if (finalImageCount < 1) {
    throw new AppError(400, "At least one active product image is required");
  }

  if (finalImageCount > 5) {
    throw new AppError(400, "Product images cannot be more than 5");
  }

  const existingImageIds = existingImages.map((image) => image.id);
  if (new Set(existingImageIds).size !== existingImageIds.length) {
    throw new AppError(400, "Existing product image IDs must be unique");
  }

  const activeImageIds = new Set(activeImages.map((image) => image.id));
  const hasInvalidImage = existingImages.some(
    (image) => !activeImageIds.has(image.id),
  );
  if (hasInvalidImage) {
    throw new AppError(400, "Product images must belong to this product");
  }

  assertUniqueProductImagePositions([
    ...existingImages.map((image) => image.position),
    ...newImagePositions,
  ]);
};

export const assertAllProductImagePositionsPayload = (
  images: TProductImagePosition[],
  activeImages: TProductGalleryImage[],
) => {
  if (images.length !== activeImages.length) {
    throw new AppError(400, "All active product images must be included");
  }

  const imageIds = images.map((image) => image.id);
  if (new Set(imageIds).size !== imageIds.length) {
    throw new AppError(400, "Product image IDs must be unique");
  }

  const activeImageIds = new Set(activeImages.map((image) => image.id));
  const hasInvalidImage = images.some((image) => !activeImageIds.has(image.id));
  if (hasInvalidImage) {
    throw new AppError(400, "Product images must belong to this product");
  }

  assertUniqueProductImagePositions(images.map((image) => image.position));
};

export const getRemovedProductImageIds = (
  activeImages: TProductGalleryImage[],
  existingImages: TProductImagePosition[],
) => {
  const keptImageIds = new Set(existingImages.map((image) => image.id));

  return activeImages
    .filter((image) => !keptImageIds.has(image.id))
    .map((image) => image.id);
};

export const uploadProductImages = async (
  files: TProductImageUploadFiles,
  positions: number[],
  slug: string,
) => {
  const uploadedPublicIds: string[] = [];

  const uploadResults = await Promise.all(
    files.map(async (file, index) => {
      try {
        const uploadResult = await cloudinaryUpload({
          file,
          id: slug,
          type: "PRODUCT",
        });

        uploadedPublicIds.push(uploadResult.public_id);

        return {
          ok: true as const,
          data: {
            image: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            position: positions[index],
          },
        };
      } catch (error) {
        return {
          ok: false as const,
          error,
        };
      }
    }),
  );

  const failedUpload = uploadResults.find((result) => !result.ok);
  if (failedUpload) {
    await cleanupUploadedProductImages(uploadedPublicIds);
    throw new AppError(500, "Failed to upload product images", false);
  }

  return {
    images: uploadResults.map(
      (result) => (result as { ok: true; data: TUploadedProductImage }).data,
    ),
    uploadedPublicIds,
  };
};
