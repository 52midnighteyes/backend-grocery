import { AppError } from "../../class/appError.js";
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
