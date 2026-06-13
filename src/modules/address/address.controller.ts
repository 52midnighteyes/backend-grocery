import type { Request, Response, NextFunction } from "express";
import { createUserAddressServices, deleteUserAddressService, getAddressesService, updateDefaultUserAddressService, updateUserAddressService } from "./address.service.js";
import { TAddressIdParam, TCreateAddressBody, TUpdateAddressBody } from "./address.validation.js";

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

export const createUserAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;              // dari token, bukan body
    const body = req.validated?.body as TCreateAddressBody;

    const address = await createUserAddressServices({ ...body, userId });

    return res.status(201).json({
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDefaultUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { addressId } = req.validated?.params as TAddressIdParam;

    const result = await updateDefaultUserAddressService(userId, addressId);

    return res.status(200).json({
      message: "Default address updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteUserAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { addressId } = req.validated?.params as TAddressIdParam;

    await deleteUserAddressService(userId, addressId);

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { addressId } = req.validated?.params as TAddressIdParam;
    const body = req.validated?.body as TUpdateAddressBody;

    const updated = await updateUserAddressService(userId, addressId, body);

    return res.status(200).json({
      message: "Address updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
