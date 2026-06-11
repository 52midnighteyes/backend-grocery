import {
  v2 as cloudinary,
  UploadApiOptions,
  type UploadApiResponse,
} from "cloudinary";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { AppError } from "../../class/appError.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const BASE_PARENT_FOLDER = "GROCERGO";
type TPicture = "PRODUCT" | "AVATAR" | "PAYMENT_PROOF";
const ALLOWED_IMAGE_FORMATS = ["jpg", "png", "gif"];
type TCloudinaryUpload = {
  file: Express.Multer.File;
  id: string;
  type: TPicture;
};

export const cloudinaryUpload = (
  params: TCloudinaryUpload
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    let folder: string;
    let uploadOptions: UploadApiOptions;

    switch (params.type) {
      case "AVATAR":
        folder = `${BASE_PARENT_FOLDER}/USERS/${params.id}/AVATARS`;
        uploadOptions = {
          folder,
          public_id: `AVATAR-${params.id}`,
          filename_override: `AVATAR-${params.id}`,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
          allowed_formats: ALLOWED_IMAGE_FORMATS,
        };
        break;

      case "PAYMENT_PROOF":
        folder = `${BASE_PARENT_FOLDER}/TRANSACTIONS/${params.id}/PAYMENT_PROOF`;
        uploadOptions = {
          folder,
          public_id: `PAYMENT_PROOF-${params.id}-${Date.now()}`,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
          allowed_formats: ["jpg", "png"], // GIF tidak diizinkan untuk bukti bayar
        };
        break;

      case "PRODUCT":
      default: {
        const uploadId = `${params.id}-${Date.now()}-${randomUUID()}`;
        folder = `${BASE_PARENT_FOLDER}/PRODUCTS/${params.id}`;
        uploadOptions = {
          folder,
          public_id: uploadId,
          overwrite: false,
          filename_override: uploadId,
          resource_type: "image",
          allowed_formats: ALLOWED_IMAGE_FORMATS,
        };
        break;
      }
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(500, "Failed to upload image to Cloudinary", false)
          );
        }

        resolve(result);
      }
    );

    Readable.from([params.file.buffer]).pipe(stream);
  });
};

export const cloudinaryDelete = async (publicId: string) => {
  const action = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (action.result !== "ok") {
    throw new AppError(500, "Failed to delete image from Cloudinary", false);
  }

  console.log("Image deleted successfully from Cloudinary", publicId);
};