import * as z from "zod";

export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce
    .number({ error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce
    .number({ error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export const forwardGeocodeQuerySchema = z.object({
  q: z.string({ error: "Search query is required" }).trim().min(1, "Search query is required"),
});

export type TReverseGeocodeQuery = z.infer<typeof reverseGeocodeQuerySchema>;
export type TForwardGeocodeQuery = z.infer<typeof forwardGeocodeQuerySchema>;
