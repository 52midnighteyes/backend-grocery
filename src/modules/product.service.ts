import { ProductCreateInput } from "../../generated/prisma/models.js";
import { AppError } from "../class/appError.js";
import { generateSku } from "../helper/sku-generator.js";
import { cloudinaryUpload } from "../libs/cloudinary/cloudinary.lib.js";
import { findCategoryById } from "./category/category.repository.js";
import {
  createProductRepo,
  findProductByName,
  getProductAndImagesRepo,
  uploadManyProductImageRepo,
} from "./product.repository.js";
import { TCreateProductParams } from "./products/product.schemas.js";

const createProductService = async (
  params: TCreateProductParams & { files?: Express.Multer.File[] }
) => {
  try {
    const isExists = await findProductByName(params.name);
    if (isExists)
      throw new AppError(400, "product with the same name already exists");

    const category = await findCategoryById(params.categoryId);
    if (!category) throw new AppError(404, "Invalid category id");

    const sku = generateSku({
      category: category.name,
      productName: params.name,
      brand: params.brand ?? null,
      variant: params.variant ?? null,
      size: params.size ?? null,
    });
    const { categoryId, files, ...productData } = params;
    const productPayload: ProductCreateInput = {
      ...productData,
      sku,
      category: {
        connect: {
          id: category.id,
        },
      },
    };
    const product = await createProductRepo(productPayload);

    if (files?.length) {
      const uploadedImages = await Promise.all(
        files.map((img) => {
          return cloudinaryUpload({
            file: img,
            id: product.id,
            type: "PRODUCT",
          });
        })
      );

      const images = uploadedImages.map((img) => ({
        secureUrl: img.secure_url,
        publicId: img.public_id,
      }));

      await uploadManyProductImageRepo(images, product.id);
    }

    return await getProductAndImagesRepo(product.id);
  } catch (error) {
    throw error;
  }
};

export { createProductService };
