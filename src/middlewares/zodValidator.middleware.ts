import type { Response, Request, NextFunction } from "express";
import { z } from "zod";

type ValidationTarget = "body" | "query" | "params";

export const validateSchema = (
  schema: z.ZodType,
  target: ValidationTarget,
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validated ??= {};
      req.validated[target] = schema.parse(req[target]);
      next();
    } catch (error) {
      console.error("message:", error);
      next(error);
    }
  };
};
