import type { Request, Response, NextFunction } from "express";
import { getAddressesService } from "./address.service.js";

export const getAddressesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const addresses = await getAddressesService(userId);
    res.status(200).json({ message: "Addresses fetched successfully", data: addresses });
  } catch (error) {
    next(error);
  }
};