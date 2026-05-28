import { Router } from "express";
import { getCategoriesController } from "./category.controller.js";

const categoryRoutes = Router();

categoryRoutes.get("/", getCategoriesController);

export default categoryRoutes;
