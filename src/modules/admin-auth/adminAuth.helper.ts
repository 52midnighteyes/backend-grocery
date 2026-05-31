import type { TAdminAuthUserWithSensitiveFields } from "./adminAuth.models.js";

export const hasAdminLoginPermission = (user: {
  role: {
    rolePermissions: {
      permission: {
        name: string;
      };
    }[];
  };
}) => {
  return user.role.rolePermissions.some(
    (rolePermission) => rolePermission.permission.name === "admin:login"
  );
};

export const sanitizeAdminAuthUser = <
  TUser extends TAdminAuthUserWithSensitiveFields | null
>(
  user: TUser
) => {
  if (!user) return null;

  const { password, roleId, storeId, ...safeUser } = user;
  return safeUser;
};
