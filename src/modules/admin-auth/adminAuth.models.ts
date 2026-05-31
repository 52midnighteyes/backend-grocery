export type TAdminAuthUserWithSensitiveFields = {
  password?: string | null;
  roleId?: string;
  storeId?: string | null;
};

export type TAdminAuthTokenPayloadSource = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
  role: {
    name: string;
  };
};
