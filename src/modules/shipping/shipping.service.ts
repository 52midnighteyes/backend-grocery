import { AppError } from "../../class/appError.js";
import { RAJAONGKIR_API_KEY } from "../../config/config.js";
import { reverseGeocode } from "../geocode/geocode.service.js";
import { findAddressById } from "../address/address.repository.js";
import { findStoresWithCoordinates } from "../store/store.repository.js";
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

// OpenCage formatted address Indonesia biasanya:
// "Jl. Nama Jalan, Kelurahan, Kecamatan, Kota, Provinsi ZIP, Indonesia"
// Kita ambil bagian pertama yang bukan jalan/angka sebagai search term ke RajaOngkir.
const extractSubdistrict = (formatted: string): string => {
  const parts = formatted.split(",").map((p) => p.trim());
  const isStreet = (p: string) =>
    /\d/.test(p) || /^jl[\s.]/i.test(p) || /^jalan\s/i.test(p);
  const nonStreet = parts.filter((p) => !isStreet(p));
  return nonStreet[0] ?? parts[0];
};

const searchRajaOngkirDestination = async (
  term: string,
): Promise<TRajaOngkirDestination | null> => {
  const url = `${RAJAONGKIR_BASE_URL}/destination/domestic-destination?search=${encodeURIComponent(term)}&limit=5&offset=0`;
  const res = await fetch(url, { headers: { key: RAJAONGKIR_API_KEY } });

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

export const getShippingCostService = async (
  userId: string,
  addressId: string,
) => {
  // 1. Fetch alamat user dari DB
  const address = await findAddressById(addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  // 2. Cari toko terdekat dari alamat user
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

  // 3. Reverse geocode keduanya secara paralel
  const [destGeo, originGeo] = await Promise.all([
    reverseGeocode(parseFloat(address.latitude), parseFloat(address.longitude)),
    reverseGeocode(parseFloat(nearest.latitude!.toString()), parseFloat(nearest.longitude!.toString())),
  ]);

  const destTerm = extractSubdistrict(destGeo.label);
  const originTerm = extractSubdistrict(originGeo.label);

  // 4. Search RajaOngkir untuk dapat subdistrict ID
  const [destResult, originResult] = await Promise.all([
    searchRajaOngkirDestination(destTerm),
    searchRajaOngkirDestination(originTerm),
  ]);

  if (!destResult)
    throw new AppError(404, `Destination area "${destTerm}" not found`);
  if (!originResult)
    throw new AppError(404, `Origin area "${originTerm}" not found`);

  // 5. Hitung ongkir
  const costs = await calculateRajaOngkirCost(originResult.id, destResult.id);

  return {
    origin: {
      id: originResult.id,
      label: originGeo.label,
      store: nearest.name,
    },
    destination: {
      id: destResult.id,
      label: destGeo.label,
    },
    costs,
  };
};