import * as z from "zod";

const UserRole = ["superAdmin", "storeAdmin", "user"] as const;

export const jwtTokenSchema = z.object({
  id: z.uuid({ error: "User ID from token is invalid" }),
  email: z.email({ error: "Email from token is invalid" }),
  name:z.string().nonempty("Name is required").trim(),
  role: z.enum(UserRole, {
    message: "user role from token is invalid",
  }),
  avatarUrl: z.url({ error: "Avatar URL from token is invalid" }).nullable(),
  isVerified: z.boolean({ error: "isVerified from token is invalid" }),
});

export type TJwtTokenPayload = z.infer<typeof jwtTokenSchema>;
