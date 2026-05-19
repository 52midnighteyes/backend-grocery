import multer from "multer";
import { AppError } from "../class/appError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          400,
          "Invalid file type. Only JPG, PNG, and WEBP are allowed."
        )
      );
    }

    cb(null, true);
  },
});
