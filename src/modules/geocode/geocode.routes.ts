import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getAddressController,
  getCoordinatesController,
} from "./geocode.controller.js";
import {
  forwardGeocodeQuerySchema,
  reverseGeocodeQuerySchema,
} from "./geocode.schemas.js";

const geocodeRoutes = Router();

// /address?lat=&lng=  -> resolve coordinates into a human-readable address
geocodeRoutes.get(
  "/address",
  validateSchema(reverseGeocodeQuerySchema, "query"),
  getAddressController
);

// /coordinates?q=  -> resolve a place name into latitude/longitude
geocodeRoutes.get(
  "/coordinates",
  validateSchema(forwardGeocodeQuerySchema, "query"),
  getCoordinatesController
);

export default geocodeRoutes;
