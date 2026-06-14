import { AppError } from "../../class/appError.js";
import { OPENCAGE_API_KEY } from "../../config/config.js";

const OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json";

// One geocoding result, normalized to just what the frontend needs.
type TGeocodeResult = { label: string; lat: number; lng: number; postcode?: string };


// Shared call to OpenCage. `query` is either "lat,lng" (reverse) or a place
// name (forward). Returns the first result, or throws if none / on API error.
const callOpenCage = async (query: string): Promise<TGeocodeResult> => {
  const url = `${OPENCAGE_URL}?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`;
  const response = await fetch(url);
  if (!response.ok) throw new AppError(502, "Geocoding service is unavailable");

  const body = (await response.json()) as { results?: TOpenCageResult[] };
  const first = body.results?.[0];
  if (!first) throw new AppError(404, "Location was not found");

  return {
    label: first.formatted,
    lat: first.geometry.lat,
    lng: first.geometry.lng,
    postcode: first.components?.postcode,
  };
};

type TOpenCageResult = {
  formatted: string;
  geometry: { lat: number; lng: number };
  components?: { postcode?: string };
};


export const reverseGeocode = async (lat: number, lng: number) => {
  return await callOpenCage(`${lat},${lng}`);
};

export const forwardGeocode = async (q: string) => {
  return await callOpenCage(q);
};
