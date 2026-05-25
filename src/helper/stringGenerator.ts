import { randomInt } from "crypto";

export const createExcerpt = (
  content: string,
  maxLength: number = 60
): string => {
  const sanitized = content.replace(/\s+/g, " ").trim();

  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return `${sanitized.slice(0, maxLength)}...`;
};

export const createSlug = (str: string): string => {
  const baseSlug = str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const uniqueSuffix = Date.now().toString().slice(-4);

  return baseSlug ? `${baseSlug}-${uniqueSuffix}` : `post-${uniqueSuffix}`;
};
