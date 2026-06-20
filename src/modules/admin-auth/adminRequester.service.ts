import { AppError } from "../../class/appError.js";
import { findAdminAccountById } from "../user/user.repository.js";

export const getAdminRequester = async (requesterId: string) => {
  const requester = await findAdminAccountById(requesterId);
  if (!requester) throw new AppError(401, "Unauthorized");

  return requester;
};

export type TAdminRequester = Awaited<ReturnType<typeof getAdminRequester>>;
