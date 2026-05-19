import * as z from "zod";
import { UserRole } from "../../../generated/prisma/enums.js";

export const jwtTokenSchema = z.object({
  id: z.uuid({ error: "User ID from token is invalid" }),
  email: z.email({ error: "Email from token is invalid" }),
  firstName: z.string().nonempty("First name is required").trim(),
  lastName: z.string().nonempty("Last name is required").trim(),
  role: z.enum(UserRole, {
    message: "user role from token is invalid",
  }),
  avatarUrl: z.url({ error: "Avatar URL from token is invalid" }).nullable(),
  isVerified: z.boolean({ error: "isVerified from token is invalid" }),
});

export type TJwtTokenPayload = z.infer<typeof jwtTokenSchema>;
