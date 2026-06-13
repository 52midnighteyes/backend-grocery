import { AppError } from "../../class/appError.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { reverseGeocode } from "../geocode/geocode.service.js";
import { extractSubdistrict, searchRajaOngkirDestination } from "../shipping/shipping.service.js";
import { createUserAddress, findAddressById, findAddressesByUserId, resetAllDefaultAddress, setDefaultAddress, softDeleteAddress, updateAddress, upsertDomestic } from "./address.repository.js";

const resolveDestination = async (lat: string, lng: string) => {
  const geo = await reverseGeocode(Number(lat), Number(lng));

  // zip dulu (paling spesifik), lalu kandidat nama area
  const zip = geo.label.match(/\b\d{5}\b/)?.[0];
  const names = geo.label
    .split(",")
    .map((p) => p.replace(/\d+/g, "").trim())
    .filter((p) => p && !/^jl[\s.]/i.test(p) && !/^jalan\s/i.test(p) && !/indonesia/i.test(p));

  const candidates = [zip, ...names].filter((v): v is string => Boolean(v));

  let dest = null;
  for (const term of candidates) {    
    dest = await searchRajaOngkirDestination(term);
    if (dest) break;
  }
  if (!dest) throw new AppError(404, "Destination area not found for this location");

  await upsertDomestic(dest);
  return dest.id;
};



export const getAddressesService = async (userId: string) => {
  return findAddressesByUserId(userId);
};

export const createUserAddressServices = async (input: {
  name: string; userId: string; lat: string; lng: string; notes?: string;
}) => {
  const domesticId = await resolveDestination(input.lat, input.lng);

  const existing = await findAddressesByUserId(input.userId);
  const isDefault = existing.length === 0;

  return createUserAddress({ ...input, domesticId, isDefault });
};



export const updateDefaultUserAddressService = async (
  userId: string,
  addressId: string,
) => {
  // 1. pastikan alamat ada DAN milik user ini
  const address = await findAddressById(addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  // 2. reset semua -> set yang dipilih, dalam satu transaksi
  return prisma.$transaction([
    resetAllDefaultAddress(userId),
    setDefaultAddress(addressId),
  ]);
};

export const deleteUserAddressService = async (
  userId: string,
  addressId: string,
) => {
  // 1. validasi ada & milik user
  const address = await findAddressById(addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  // 2. soft-delete
  await softDeleteAddress(addressId, userId);

  // 3. kalau yang dihapus adalah default, promote alamat tersisa jadi default
  if (address.isDefault) {
    const [next] = await findAddressesByUserId(userId); // sudah exclude yg deleted
    if (next) await setDefaultAddress(next.id);
  }
};


export const updateUserAddressService = async (
  userId: string,
  addressId: string,
  input: { name?: string; lat?: string; lng?: string; notes?: string },
) => {
  // 1. validasi ada & milik user
  const address = await findAddressById(addressId, userId);
  if (!address) throw new AppError(404, "Address not found");

  // 2. susun data yang akan diupdate (hanya field yang dikirim)
  const data: {
    name?: string;
    notes?: string;
    latitude?: string;
    longitude?: string;
    domesticId?: number;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.notes !== undefined) data.notes = input.notes;

  // 3. hanya kalau koordinat berubah -> resolve ulang domesticId
  if (input.lat !== undefined && input.lng !== undefined) {
    data.latitude = input.lat;
    data.longitude = input.lng;
    data.domesticId = await resolveDestination(input.lat, input.lng);
  }

  // 4. update
  return updateAddress(addressId, data);
};

