import { findAddressesByUserId } from "./address.repository.js";

export const getAddressesService = async (userId: string) => {
  return findAddressesByUserId(userId);
};