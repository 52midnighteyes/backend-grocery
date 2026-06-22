import type { DiscountType } from "../../../generated/prisma/enums.js";

export type TPublicDiscountCandidate = {
  name: string;
  type: DiscountType;
  value: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  quota: number | null;
  usedQuota: number;
  productId: string;
  startDate: Date;
  endDate: Date;
};

export type TPublicDiscount = {
  name: string;
  type: DiscountType;
  value: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  startDate: Date;
  endDate: Date;
};

export type TPublicPricePreview = {
  originalPrice: number;
  finalPrice: number | null;
  discountAmount: number | null;
  isDiscounted: boolean;
  label: string | null;
  calculationMode: "none" | "unitPrice" | "quantityBased";
};
