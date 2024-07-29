import { Router } from "express";
const mainRouter: Router = Router();

import userRoutes from "./userRoutes";
import internshipRoutes from "./internRoutes";

mainRouter.use(userRoutes).use(internshipRoutes);

export default mainRouter;