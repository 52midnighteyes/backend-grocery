export type TRegisterUserPayload = {
  referrerUserId?: string | undefined;
  passwordHash: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ORGANIZER";
};
