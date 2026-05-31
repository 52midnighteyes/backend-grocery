import { AppError } from "../../class/appError.js";
import {
  countUsers,
  findUserById,
  findUsers,
} from "../user/user.repository.js";
import {
  buildManagedUserOrderBy,
  buildManagedUserWhere,
  buildPaginationMeta,
  sanitizeManagedUser,
} from "./userManagement.helper.js";
import type { TGetManagedUsersQuery } from "./userManagement.schemas.js";

export const getManagedUsersService = async (params: TGetManagedUsersQuery) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildManagedUserWhere(params);
  const orderBy = buildManagedUserOrderBy(params);

  const [users, total] = await Promise.all([
    findUsers(where, {
      skip,
      take: limit,
      orderBy,
    }),
    countUsers(where),
  ]);

  return {
    data: users.map((user) => sanitizeManagedUser(user)),
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getManagedUserByIdService = async (id: string) => {
  const user = await findUserById(id);
  if (!user) throw new AppError(404, "User was not found");

  return sanitizeManagedUser(user);
};
