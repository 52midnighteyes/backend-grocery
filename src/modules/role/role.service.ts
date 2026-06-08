import { AppError } from "../../class/appError.js";
import { findRoleById, findRoles } from "./role.repository.js";

const buildRoleDetail = (
  role: NonNullable<Awaited<ReturnType<typeof findRoleById>>>,
) => {
  const { rolePermissions, ...roleData } = role;

  return {
    ...roleData,
    permissions: rolePermissions.map(
      (rolePermission) => rolePermission.permission,
    ),
  };
};

export const getRolesService = async () => {
  return await findRoles();
};

export const getRoleByIdService = async (id: string) => {
  const role = await findRoleById(id);
  if (!role) throw new AppError(404, "Role was not found");

  return buildRoleDetail(role);
};
