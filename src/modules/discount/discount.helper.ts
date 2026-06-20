import type {
  TPublicDiscount,
  TPublicDiscountCandidate,
  TPublicPricePreview,
} from "./discount.models.js";

export const hasAvailableDiscountQuota = (
  discount: Pick<TPublicDiscountCandidate, "quota" | "usedQuota">
) => {
  return discount.quota === null || discount.usedQuota < discount.quota;
};

export const buildPublicDiscount = (
  discount: TPublicDiscountCandidate
): TPublicDiscount => {
  return {
    name: discount.name,
    type: discount.type,
    value: discount.value,
    buyQuantity: discount.buyQuantity,
    getQuantity: discount.getQuantity,
    startDate: discount.startDate,
    endDate: discount.endDate,
  };
};

const buildDiscountLabel = (
  discount: TPublicDiscountCandidate,
  discountAmount?: number
) => {
  if (discount.type === "percentage") return `${discount.value}% off`;
  if (discount.type === "nominal") return `Rp ${discountAmount ?? 0} off`;

  return `Buy ${discount.buyQuantity} Get ${discount.getQuantity}`;
};

export const buildPricePreview = (
  price: number,
  discount?: TPublicDiscountCandidate
): TPublicPricePreview => {
  if (!discount) {
    return {
      originalPrice: price,
      finalPrice: price,
      discountAmount: 0,
      isDiscounted: false,
      label: null,
      calculationMode: "none",
    };
  }

  if (discount.type === "buyXGetY") {
    return {
      originalPrice: price,
      finalPrice: null,
      discountAmount: null,
      isDiscounted: true,
      label: buildDiscountLabel(discount),
      calculationMode: "quantityBased",
    };
  }

  const discountAmount =
    discount.type === "percentage"
      ? Math.floor((price * (discount.value ?? 0)) / 100)
      : Math.min(discount.value ?? 0, price);

  return {
    originalPrice: price,
    finalPrice: Math.max(price - discountAmount, 0),
    discountAmount,
    isDiscounted: discountAmount > 0,
    label: buildDiscountLabel(discount, discountAmount),
    calculationMode: "unitPrice",
  };
};

export const attachPublicDiscountPreview = <TProduct extends { price: number }>(
  product: TProduct,
  discount?: TPublicDiscountCandidate
) => {
  return {
    ...product,
    activeDiscount: discount ? buildPublicDiscount(discount) : null,
    pricePreview: buildPricePreview(product.price, discount),
  };
};
