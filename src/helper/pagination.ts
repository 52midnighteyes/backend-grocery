import type { TPaginationMeta } from "../models/pagination.models.js";

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): TPaginationMeta => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
