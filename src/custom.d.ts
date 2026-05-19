import type { UserRole } from "../generated/prisma/enums.js";

export interface IUserParams {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface IValidatedRequest {
  query?: unknown;
  body?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserParams;
      validated?: IValidatedRequest;
    }
  }
}
