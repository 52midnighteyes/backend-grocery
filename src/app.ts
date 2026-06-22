import express, { NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { FRONTEND_URL, NODE_ENV, PORT } from "./config/config.js";
import helmet from "helmet";
import { AppError } from "./class/appError.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import adminDashboardRoutes from "./modules/admin-dashboard/adminDashboard.routes.js";
import adminManagementRoutes from "./modules/admin-management/adminManagement.routes.js";
import adminCategoryRoutes from "./modules/admin-category/adminCategory.routes.js";
import adminStoreRoutes from "./modules/admin-store/adminStore.routes.js";
import adminProductRoutes from "./modules/admin-product/adminProduct.routes.js";
import adminAuthRoutes from "./modules/admin-auth/adminAuth.routes.js";
import adminStockRoutes from "./modules/admin-stock/adminStock.routes.js";
import stockTransferRoutes from "./modules/stock-transfer/stockTransfer.routes.js";
import authRouter from "./modules/auth/auth.router.js";
import productRoutes from "./modules/product/product.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import roleRoutes from "./modules/role/role.routes.js";
import stockRoutes from "./modules/stock/stock.routes.js";
import storeRoutes from "./modules/store/store.routes.js";
import userManagementRoutes from "./modules/user-management/userManagement.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import geocodeRoutes from "./modules/geocode/geocode.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import shippingRoutes from "./modules/shipping/shipping.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";

const app = express();

//middleware
app.disable("x-powered-by");
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("===== Incoming Request =====");
  console.log("Time     :", new Date().toISOString());
  console.log("Method   :", req.method);
  console.log("URL      :", req.originalUrl);
  console.log("Headers  :", req.headers);
  console.log("Body     :", req.body);
  console.log("Query    :", req.query);
  console.log("File     :", req.file);
  console.log("refreshToken :", req.cookies.refreshToken);
  console.log("adminRefreshToken :", req.cookies.adminRefreshToken);
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
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/admin-accounts", adminManagementRoutes);
app.use("/api/admin/users", userManagementRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/stores", adminStoreRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admin/stock/transfers", stockTransferRoutes);
app.use("/api/admin/stock", adminStockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/geocode", geocodeRoutes);

//route not found handler
app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

//errorHandler
app.use(errorHandler);

export default app;
