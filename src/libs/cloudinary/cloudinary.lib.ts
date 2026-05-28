import {
  v2 as cloudinary,
  UploadApiOptions,
  type UploadApiResponse,
} from "cloudinary";
import { Readable } from "node:stream";
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
type TPicture = "PRODUCT" | "AVATAR";
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
    const folder =
      params.type === "AVATAR"
        ? `${BASE_PARENT_FOLDER}/USERS/${params.id}/AVATARS`
        : `${BASE_PARENT_FOLDER}/PRODUCTS/${params.id}`;

    let uploadOptions: UploadApiOptions;

    switch (params.type) {
      case "AVATAR":
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

      case "PRODUCT":
        uploadOptions = {
          folder,
          public_id: `${params.id}-${Date.now()}`,
          overwrite: false,
          filename_override: `${params.id}-${Date.now()}`,
          resource_type: "image",
          allowed_formats: ALLOWED_IMAGE_FORMATS,
        };
        break;

      default:
        uploadOptions = {
          folder,
          resource_type: "image",
          allowed_formats: ALLOWED_IMAGE_FORMATS,
        };
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
