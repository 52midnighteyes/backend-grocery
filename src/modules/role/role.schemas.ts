import * as z from "zod";

export const roleIdParamSchema = z.object({
  id: z.uuid({ error: "Role ID is invalid" }),
});

export type TRoleIdParam = z.infer<typeof roleIdParamSchema>;
