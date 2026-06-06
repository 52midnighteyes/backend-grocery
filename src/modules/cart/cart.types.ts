export type TAddToCartPayload = {
  productId: string;
  quantity: number;
  storeId: string;
};

export type TUpdateCartPayload = {
  quantity: number;
};