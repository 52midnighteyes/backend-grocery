import { prisma } from "../../libs/prisma/prisma.lib.js";

export const findAddressesByUserId = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      notes: true,
      isDefault: true,
    },
  });
};

export const findAddressById = async (addressId: string, userId: string) => {
  return prisma.address.findFirst({
    where: { id: addressId, userId, deletedAt: null },
    include: { domestic: true },
  });
};

export const createUserAddress = async (input: {
  name: string;
  userId: string;
  domesticId: number;
  lng: string;
  lat: string;
  notes?: string;
  isDefault?: boolean;
}) => {
  return prisma.address.create({
    data: {
      name: input.name,
      userId: input.userId,
      domesticId: input.domesticId,
      longitude: input.lng,
      latitude: input.lat,       
      notes: input.notes,
      isDefault: input.isDefault ?? false, 
    },
  });
};


export const resetAllDefaultAddress =  (userId: string) => {
  return prisma.address.updateMany({
    where: { userId, deletedAt: null },
    data: {isDefault: false}
  });
};

export const setDefaultAddress =  (addressId: string) => {
  return prisma.address.update({
    where: {id: addressId},
    data: {isDefault: true}
  })
}

export const upsertDomestic = async (dest: {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}) => {
  return prisma.domestic.upsert({
    where: { id: dest.id },
    update: {},                       
    create: {
      id: dest.id,
      label: dest.label,
      provinceName: dest.province_name,
      cityName: dest.city_name,
      districtName: dest.district_name,
      subdistrictName: dest.subdistrict_name,
      zipCode: dest.zip_code,
    },
  });
};

export const softDeleteAddress = (addressId: string, userId: string) => {
  return prisma.address.updateMany({
    where: { id: addressId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};

export const updateAddress = (
  addressId: string,
  data: {
    name?: string;
    notes?: string;
    latitude?: string;
    longitude?: string;
    domesticId?: number;
  },
) => {
  return prisma.address.update({
    where: { id: addressId },
    data,
  });
};
