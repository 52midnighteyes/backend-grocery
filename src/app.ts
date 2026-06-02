import express, { NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { FRONTEND_URL, NODE_ENV, PORT } from "./config/config.js";
import helmet from "helmet";
import { AppError } from "./class/appError.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import authRouter from "./modules/auth/auth.router.js";
import CartRouter from "./modules/cart/cart.route.js";

const app = express();

//middleware
app.disable("x-powered-by");
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use("/api/cart", CartRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (NODE_ENV.toLowerCase() !== "development") {
    return next();
  }

  console.log("===== Incoming Request =====");
  console.log("Time     :", new Date().toISOString());
  console.log("Method   :", req.method);
  console.log("URL      :", req.originalUrl);
  console.log("Headers  :", req.headers);
  console.log("Body     :", req.body);
  console.log("Query    :", req.query);
  console.log("File     :", req.file);
  console.log("refreshToken :", req.cookies.refreshToken);
  console.log("============================\n");

  next();
});

app.use("/", (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

//routes
app.get("/", (_req: Request, res: Response) => {
  res.send(`Auth boilerplate is running on port: ${PORT}`);
});

app.use("/api/auth", authRouter);

//route not found handler
app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

//errorHandler
app.use(errorHandler);

export default app;
