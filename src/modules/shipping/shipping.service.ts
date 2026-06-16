import { AppError } from "../../class/appError.js";
import { RAJAONGKIR_API_KEY } from "../../config/config.js";
import { reverseGeocode } from "../geocode/geocode.service.js";
import { findAddressById, updateAddress, upsertDomestic } from "../address/address.repository.js";
import { findStoresWithCoordinates, updateStoreDomestic } from "../store/store.repository.js";
import { haversineDistanceKm } from "../../helper/geo.js";

const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1";

// Kurir yang disupport — bisa ditambah sesuai kebutuhan
const DEFAULT_COURIERS = "jne:jnt:sicepat:anteraja:pos";

// Default berat 1kg karena tidak ada data berat produk
const DEFAULT_WEIGHT_GRAM = 1000;

type TRajaOngkirDestination = {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
};

type TRajaOngkirCostItem = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

// Resolve a RajaOngkir destination id for a point. Reuse a stored domesticId
// when present; otherwise geocode, search by zip code, persist the Domestic
// row, then let the caller save the id back onto its owner (address/store).
const resolveDomestic = async (
  cached: { domesticId: number | null; domestic: { id: number; label: string } | null },
  coords: { lat: number; lng: number },
  persistId: (domesticId: number) => Promise<unknown>,
): Promise<{ id: number; label: string }> => {
  if (cached.domesticId && cached.domestic) {
    return { id: cached.domestic.id, label: cached.domestic.label };
  }

  const geo = await reverseGeocode(coords.lat, coords.lng);
  const term = geo.postcode ?? extractSubdistrict(geo.label);
  const result = await searchRajaOngkirDestination(term);
  if (!result) throw new AppError(404, `Area "${term}" not found`);

  await upsertDomestic(result);   // FK target dibuat dulu
  await persistId(result.id);     // baru tunjuk ke situ

  return { id: result.id, label: result.label };
};


// OpenCage formatted address Indonesia biasanya:
// "Jl. Nama Jalan, Kelurahan, Kecamatan, Kota, Provinsi ZIP, Indonesia"
// Kita ambil bagian pertama yang bukan jalan/angka sebagai search term ke RajaOngkir.
export const extractSubdistrict = (formatted: string): string => {
  const parts = formatted.split(",").map((p) => p.trim());
  const isStreet = (p: string) =>
    /\d/.test(p) || /^jl[\s.]/i.test(p) || /^jalan\s/i.test(p);
  const nonStreet = parts.filter((p) => !isStreet(p));
  return nonStreet[0] ?? parts[0];
};

export const searchRajaOngkirDestination = async (
  term: string,
): Promise<TRajaOngkirDestination | null> => {
  const url = `${RAJAONGKIR_BASE_URL}/destination/domestic-destination?search=${encodeURIComponent(term)}&limit=5&offset=0`;
  const res = await fetch(url, { headers: { key: RAJAONGKIR_API_KEY } });

  if (res.status === 404) return null;      
  if (!res.ok) throw new AppError(502, "Shipping service is unavailable");

  const body = (await res.json()) as {
    meta: { code: number; status: string };
    data: TRajaOngkirDestination[] | null;
  };

  return body.data?.[0] ?? null;
};

const calculateRajaOngkirCost = async (
  originId: number,
  destinationId: number,
): Promise<TRajaOngkirCostItem[]> => {
  const params = new URLSearchParams({
    origin: String(originId),
    destination: String(destinationId),
    weight: String(DEFAULT_WEIGHT_GRAM),
    courier: DEFAULT_COURIERS,
    price: "lowest",
  });

  const res = await fetch(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
    method: "POST",
    headers: {
      key: RAJAONGKIR_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) throw new AppError(502, "Failed to calculate shipping cost");

  const body = (await res.json()) as {
    meta: { code: number; status: string };
    data: TRajaOngkirCostItem[] | null;
  };

  return body.data ?? [];
};

export const getShippingCostService = async (userId: string, addressId: string) => {
  const address = await findAddressById(addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  const stores = await findStoresWithCoordinates();
  if (!stores.length) throw new AppError(404, "No stores available");

  const nearest = stores
    .map((store) => ({
      ...store,
      distance: haversineDistanceKm(
        parseFloat(address.latitude),
        parseFloat(address.longitude),
        parseFloat(store.latitude!.toString()),
        parseFloat(store.longitude!.toString()),
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  const [destination, origin] = await Promise.all([
    resolveDomestic(
      { domesticId: address.domesticId, domestic: address.domestic },
      { lat: parseFloat(address.latitude), lng: parseFloat(address.longitude) },
      (id) => updateAddress(addressId, { domesticId: id }),
    ),
    resolveDomestic(
      { domesticId: nearest.domesticId, domestic: nearest.domestic },
      { lat: parseFloat(nearest.latitude!.toString()), lng: parseFloat(nearest.longitude!.toString()) },
      (id) => updateStoreDomestic(nearest.id, id),
    ),
  ]);

  const costs = await calculateRajaOngkirCost(origin.id, destination.id);

  return {
    origin: { id: origin.id, label: origin.label, store: nearest.name },
    destination: { id: destination.id, label: destination.label },
    costs,
  };
};
