import { randomInt } from "crypto";

export const createExcerpt = (
  content: string,
  maxLength: number = 60,
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

export function generateReferralCode(name: string, length: number): string {
  const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";
  const prefix = name.slice(0, 2).toUpperCase();

  let code = "";
  for (let i = 0; i < length; i++) {
    code += REFERRAL_ALPHABET[randomInt(0, REFERRAL_ALPHABET.length)];
  }

  return prefix + code;
}

export function generateTicketCode(length: number = 10): string {
  const TICKET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";
  let code = "TKT";

  for (let i = 0; i < length; i++) {
    code += TICKET_ALPHABET[randomInt(0, TICKET_ALPHABET.length)];
  }

  return code;
}
