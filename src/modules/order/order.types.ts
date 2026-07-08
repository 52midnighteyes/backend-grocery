export type TCreateOrderItemPayload = {
  productId: string;
  quantity: number;
  discountId?: string;
  name: string;
  totalPrice: number;
  requiresFulfillment: boolean;
  storeStockAtOrder: number;
  shortageQuantity: number;
};

export type TCreateOrderPayload = {
  customerId: string;
  storeId: string;
  addressId: string;
  shippingVendor: string;
  deliveryFee: number;
  totalPrice: number;
  voucherId?: string;
  deliveryVoucherId?: string;
  items: TCreateOrderItemPayload[];
};

export type TCreateOrderInput = {
  storeId: string;
  addressId: string;
  shippingVendor: string;
  deliveryFee: number;
  voucherId?: string;
  deliveryVoucherId?: string;
  items: TCreateOrderRawItem[];
};

export type TCreateOrderRawItem = {
  productId: string;
  quantity: number;
  discountId?: string;
};

export type TGetOrdersQueryType = {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy: "createdAt";
  sortOrder: "asc" | "desc";
};