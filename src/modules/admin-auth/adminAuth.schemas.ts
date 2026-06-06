import * as z from "zod";

export const adminLoginBodySchema = z.object({
  email: z.email("Email format is invalid"),
  password: z.string().min(1, "Password is required"),
});

export type TAdminLoginBody = z.infer<typeof adminLoginBodySchema>;
