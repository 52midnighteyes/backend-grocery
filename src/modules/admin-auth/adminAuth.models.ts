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
  roleId: string;
  store: {
    id: string;
    name: string;
    latitude: unknown;
    longitude: unknown;
  } | null;
  role: {
    id: string;
    name: string;
  };
};

export type TAdminSession = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  role: string;
  roleId: string;
  store: {
    id: string;
    name: string;
    latitude: unknown;
    longitude: unknown;
  } | null;
};
