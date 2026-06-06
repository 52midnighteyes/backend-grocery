import { AppError } from "../../class/appError.js";
import { countStores } from "../store/store.repository.js";
import { findStoreById } from "../store/store.repository.js";
import {
  countUsers,
  findStoreDashboardAdmins,
  findUserById,
} from "../user/user.repository.js";
import {
  buildActiveStoresWhere,
  buildAdminAccountsWhere,
  buildRegisteredUsersWhere,
  buildStoreDashboardAdmin,
  buildStoreDashboardStore,
} from "./adminDashboard.helper.js";

export const getAdminDashboardSummaryService = async () => {
  const [
    totalStores,
    totalRegisteredUsers,
    totalVerifiedUsers,
    totalAdminAccounts,
    totalStoreAdmins,
    totalSuperAdmins,
  ] = await Promise.all([
    countStores(buildActiveStoresWhere()),
    countUsers(buildRegisteredUsersWhere()),
    countUsers(buildRegisteredUsersWhere({ isVerified: true })),
    countUsers(buildAdminAccountsWhere()),
    countUsers(buildAdminAccountsWhere({ roleName: "storeAdmin" })),
    countUsers(buildAdminAccountsWhere({ roleName: "superAdmin" })),
  ]);

  return {
    totalStores,
    totalRegisteredUsers,
    totalVerifiedUsers,
    totalAdminAccounts,
    totalStoreAdmins,
    totalSuperAdmins,
  };
};

export const getStoreDashboardSummaryService = async (
  storeId: string,
  requesterId: string
) => {
  const [store, requester] = await Promise.all([
    findStoreById(storeId),
    findUserById(requesterId),
  ]);

  if (!store) throw new AppError(404, "Store was not found");
  if (!requester) throw new AppError(401, "Unauthorized");

  if (requester.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(403, "Forbidden");
  }

  const storeAdminsWhere = buildAdminAccountsWhere({
    roleName: "storeAdmin",
    storeId,
  });

  const [totalStoreAdmins, totalVerifiedStoreAdmins, storeAdmins] =
    await Promise.all([
      countUsers(storeAdminsWhere),
      countUsers(
        buildAdminAccountsWhere({
          roleName: "storeAdmin",
          storeId,
          isVerified: true,
        })
      ),
      findStoreDashboardAdmins(storeAdminsWhere),
    ]);

  return {
    store: buildStoreDashboardStore(store),
    metrics: {
      totalStoreAdmins,
      totalVerifiedStoreAdmins,
    },
    storeAdmins: storeAdmins.map(buildStoreDashboardAdmin),
  };
};
