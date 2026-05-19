type TSameSite = boolean | "none" | "lax" | "strict";

export type TCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: TSameSite;
  maxAge: number;
  path: string;
};
