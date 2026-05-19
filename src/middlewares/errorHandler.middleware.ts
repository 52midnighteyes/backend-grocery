import type { Request, Response, NextFunction } from "express";
import { AppError } from "../class/appError.js";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import Jwt from "jsonwebtoken";
import { MulterError } from "multer";

class ErrorHandler {
  public handle = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err instanceof AppError) {
      console.log(err.message);
      return res.status(err.statusCode).json({
        message: err.message,
      });
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error("Prisma validation error:", err);

      return res.status(400).json({
        message: "Invalid database input",
      });
    }

    if (err instanceof ZodError) {
      console.log(err.issues);
      return res.status(400).json({ message: err.issues[0]?.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          return res.status(409).json({
            message: "Already exists",
          });

        case "P2025":
          return res.status(404).json({
            message: "Record not found",
          });

        default:
          return res.status(400).json({
            message: "Database error",
          });
      }
    }

    if (err instanceof Jwt.TokenExpiredError) {
      console.error("Token expired:", err);
      return res.status(401).json({
        message: "Token expired",
      });
    }

    if (err instanceof Jwt.JsonWebTokenError) {
      console.error("JWT error:", err);
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (err instanceof MulterError) {
      console.error("Multer error:", err);
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          return res.status(413).json({
            message: "File too large",
          });
        case "LIMIT_FILE_COUNT":
          return res.status(400).json({
            message: "Too many files",
          });
        case "LIMIT_UNEXPECTED_FILE":
          return res.status(400).json({
            message: "Unexpected file field",
          });
        default:
          return res.status(400).json({
            message: "File upload error",
          });
      }
    }

    if (err instanceof SyntaxError && "body" in err) {
      console.error("JSON syntax error:", err);
      return res.status(400).json({
        message: "Invalid JSON format",
      });
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
      console.error("Database connection error:", err);
      return res.status(503).json({
        message: "Database connection failed",
      });
    }

    if (err instanceof Prisma.PrismaClientRustPanicError) {
      console.error("Database panic error:", err);
      return res.status(500).json({
        message: "Database error occurred",
      });
    }

    if (err instanceof Error) {
      console.error(err);
      return res.status(500).json({
        message: err.message,
      });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  };
}

export const errorHandler = new ErrorHandler().handle;
