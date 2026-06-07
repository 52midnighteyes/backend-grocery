export type TUploadedProductImage = {
  image: string;
  publicId: string;
  position: number;
};

export type TProductImageUploadFiles = Express.Multer.File[];

export type TProductImagePosition = {
  id: string;
  position: number;
};

export type TAdminProductScope = {
  storeId?: string;
};

export type TProductGalleryImage = {
  id: string;
};
