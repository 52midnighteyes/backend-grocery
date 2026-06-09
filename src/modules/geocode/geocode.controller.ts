import type { NextFunction, Request, Response } from "express";
import { forwardGeocode, reverseGeocode } from "./geocode.service.js";
import type {
  TForwardGeocodeQuery,
  TReverseGeocodeQuery,
} from "./geocode.schemas.js";

// GET the address for a pair of coordinates (reverse geocoding).
export const getAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lat, lng } = req.validated?.query as TReverseGeocodeQuery;
    const result = await reverseGeocode(lat, lng);

    return res.status(200).json({
      message: "Address resolved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET the coordinates for a place name (forward geocoding).
export const getCoordinatesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.validated?.query as TForwardGeocodeQuery;
    const result = await forwardGeocode(q);

    return res.status(200).json({
      message: "Coordinates resolved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
