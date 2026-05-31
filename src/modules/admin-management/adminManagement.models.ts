export type TAdminAccountWithSensitiveFields = {
  password?: string | null;
  roleId?: string;
  storeId?: string | null;
};

export type TPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
