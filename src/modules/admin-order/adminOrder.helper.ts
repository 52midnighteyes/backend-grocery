import { AppError } from "../../class/appError.js";
import { findUserById } from "../user/user.repository.js";

export type TAdminOrderScope = {
    storeId?: string;
};

// Menentukan scope data berdasarkan role admin yang sedang login.
// superAdmin: tidak ada batasan storeId (scope kosong).
// storeAdmin: wajib punya storeId, hanya bisa akses data toko sendiri.
// Pola identik dengan getAdminProductScope di adminProduct.helper.ts.

export const getAdminOrderScope = async (
    requesterId: string,
): Promise<TAdminOrderScope> => {
    const requester = await findUserById(requesterId);
    if (!requester) throw new AppError(401, "Unauthorized");

    if (requester.role.name === "superAdmin") return {};

    if (requester.storeId) {
        return { storeId: requester.storeId };
    }

    if (requester.role.name === "storeAdmin") {
        throw new AppError(403, "Store admin is not assigned to a store");
    }
    
    return {};
};