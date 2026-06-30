import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { generateSku } from "../../helper/sku-generator.js";
import { createSlug } from "../../helper/stringGenerator.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import {
  assertAllProductImagePositionsPayload,
  assertProductGalleryPayload,
  assertProductImagePayload,
  cleanupUploadedProductImages,
  deleteProductImagesFromCloudinary,
  getRemovedProductImageIds,
  getAdminProductScope,
  buildAdminProductListOrderBy,
  buildAdminProductListWhere,
  uploadProductImages,
} from "./adminProduct.helper.js";
import {
  countAdminProducts,
  createProductStocks,
  createProductImages,
  createProduct,
  findAdminProducts,
  findActiveStoreIds,
  findCategoryById,
  findAdminProductBySlug,
  findProductByName,
  findProductByNameExceptId,
  findProductBySku,
  findProductBySkuExceptId,
  softDeleteProduct,
  softDeleteProductImages,
  softDeleteProductImage,
  softDeleteProductImagesByIds,
  softDeleteProductStocks,
  updateProduct,
  updateProductImagePosition,
} from "./adminProduct.repository.js";
import type {
  TCreateProductBody,
  TGetAdminProductsQuery,
  TUpdateProductBody,
  TUpdateProductImagePositionsBody,
  TPatchProductImagesBody,
} from "./adminProduct.schemas.js";
import type { TProductImageUploadFiles } from "./adminProduct.models.js";

export const getAdminProductsService = async (
  params: TGetAdminProductsQuery,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const scopedParams = {
    ...params,
    storeId: scope.storeId ?? params.storeId,
  };
  const page = scopedParams.page;
  const limit = scopedParams.limit;
  const skip = (page - 1) * limit;
  const where = buildAdminProductListWhere(scopedParams);
  const orderBy = buildAdminProductListOrderBy(scopedParams);

  const [products, total] = await Promise.all([
    findAdminProducts(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countAdminProducts(where),
  ]);

  return {
    data: products,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const createProductService = async (
  params: TCreateProductBody,
  files: TProductImageUploadFiles
) => {
  assertProductImagePayload(files, params.positions);

  const category = await findCategoryById(params.categoryId);
  if (!category) throw new AppError(404, "Category was not found");

  const existingProduct = await findProductByName(params.name);
  if (existingProduct)
    throw new AppError(400, "Product name is already in use");

  const sku = generateSku({
    category: category.name,
    brand: params.brand,
    productName: params.name,
    variant: params.variant,
    size: params.size,
  });

  const existingSku = await findProductBySku(sku);
  if (existingSku) throw new AppError(400, "Product SKU is already in use");

  const slug = createSlug(params.name);
  const { images, uploadedPublicIds } = await uploadProductImages(
    files,
    params.positions,
    slug
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await createProduct(
        {
          name: params.name,
          slug,
          brand: params.brand,
          variant: params.variant,
          size: params.size,
          description: params.description,
          sku,
          price: params.price,
          ...(params.weight !== undefined ? { weight: params.weight } : {}),
          category: {
            connect: {
              id: category.id,
            },
          },
          images: {
            createMany: {
              data: images,
            },
          },
        },
        tx
      );

      const stores = await findActiveStoreIds(tx);
      await createProductStocks(
        stores.map((store) => ({
          productId: product.id,
          storeId: store.id,
          stock: 0,
        })),
        tx
      );

      return product;
    });
  } catch (error) {
    await cleanupUploadedProductImages(uploadedPublicIds);
    throw error;
  }
};

export const patchProductImagesService = async (
  slug: string,
  params: TPatchProductImagesBody,
  files: TProductImageUploadFiles,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  assertProductGalleryPayload(
    params.existingImages,
    files,
    params.newImagePositions,
    product.images
  );

  const removedImageIds = getRemovedProductImageIds(
    product.images,
    params.existingImages
  );
  const { images, uploadedPublicIds } = await uploadProductImages(
    files,
    params.newImagePositions,
    slug
  );

  try {
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        params.existingImages.map((image) =>
          updateProductImagePosition(image, tx)
        )
      );
      await softDeleteProductImagesByIds(product.id, removedImageIds, tx);
      await createProductImages(product.id, images, tx);
    });
  } catch (error) {
    await cleanupUploadedProductImages(uploadedPublicIds);
    throw error;
  }

  return await findAdminProductBySlug(slug, scope);
};

export const updateProductService = async (
  slug: string,
  params: TUpdateProductBody,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  if (params.name && params.name !== product.name) {
    const existingProduct = await findProductByNameExceptId(
      params.name,
      product.id
    );
    if (existingProduct) {
      throw new AppError(400, "Product name is already in use");
    }
  }

  const category = params.categoryId
    ? await findCategoryById(params.categoryId)
    : product.category;
  if (!category) throw new AppError(404, "Category was not found");

  const nextName = params.name ?? product.name;
  const nextBrand = params.brand !== undefined ? params.brand : product.brand;
  const nextVariant =
    params.variant !== undefined ? params.variant : product.variant;
  const nextSize = params.size !== undefined ? params.size : product.size;
  const sku = generateSku({
    category: category.name,
    brand: nextBrand,
    productName: nextName,
    variant: nextVariant,
    size: nextSize,
  });

  const existingSku = await findProductBySkuExceptId(sku, product.id);
  if (existingSku) throw new AppError(400, "Product SKU is already in use");

  return await prisma.$transaction(async (tx) => {
    return await updateProduct(
      product.id,
      {
        name: params.name,
        slug: params.name ? createSlug(params.name) : undefined,
        brand: params.brand,
        variant: params.variant,
        size: params.size,
        description: params.description,
        price: params.price,
        weight: params.weight,
        sku,
        ...(params.categoryId
          ? {
              category: {
                connect: {
                  id: params.categoryId,
                },
              },
            }
          : {}),
      },
      tx
    );
  });
};

export const updateProductImagePositionsService = async (
  slug: string,
  params: TUpdateProductImagePositionsBody,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  assertAllProductImagePositionsPayload(params.images, product.images);

  await prisma.$transaction(async (tx) => {
    await Promise.all(
      params.images.map((image) => updateProductImagePosition(image, tx))
    );
  });

  return await findAdminProductBySlug(slug, scope);
};

export const deleteProductImageService = async (
  slug: string,
  imageId: string,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  const image = product.images.find(
    (productImage) => productImage.id === imageId
  );
  if (!image) throw new AppError(404, "Product image was not found");

  if (product.images.length <= 1) {
    throw new AppError(400, "At least one active product image is required");
  }

  await prisma.$transaction(async (tx) => {
    await softDeleteProductImage(product.id, image.id, tx);
  });

  return await findAdminProductBySlug(slug, scope);
};

export const getScopedAdminProductBySlugService = async (
  slug: string,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  return product;
};

export const deleteProductService = async (
  slug: string,
  requesterId: string
) => {
  const scope = await getAdminProductScope(requesterId);
  const product = await findAdminProductBySlug(slug, scope);
  if (!product) throw new AppError(404, "Product was not found");

  await deleteProductImagesFromCloudinary(
    product.images
      .map((image) => image.publicId)
      .filter((publicId): publicId is string => Boolean(publicId))
  );

  await prisma.$transaction(async (tx) => {
    await softDeleteProductImages(product.id, tx);
    await softDeleteProductStocks(product.id, tx);
    await softDeleteProduct(product.id, tx);
  });

  return product;
};
