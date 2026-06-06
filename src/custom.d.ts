import { TJwtTokenPayload } from "./middlewares/tokenVerification/tokenVerification.schema.ts";

export interface IValidatedRequest {
  query?: unknown;
  body?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: TJwtTokenPayload;
      validated?: IValidatedRequest;
    }
  }
}
