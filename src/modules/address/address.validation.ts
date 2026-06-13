import { z } from "zod";

export const createAddressBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  lat: z.string().min(1, "Latitude is required"),
  lng: z.string().min(1, "Longitude is required"),
  notes: z.string().optional(),
});

export const addressIdParamSchema = z.object({
  addressId: z.string().uuid("Invalid address id"),
});

export const updateAddressBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    lat: z.string().min(1).optional(),
    lng: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine((d) => (d.lat === undefined) === (d.lng === undefined), {
    message: "lat and lng must be provided together",
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });
  
export type TCreateAddressBody = z.infer<typeof createAddressBodySchema>;
export type TAddressIdParam = z.infer<typeof addressIdParamSchema>;
export type TUpdateAddressBody = z.infer<typeof updateAddressBodySchema>;
