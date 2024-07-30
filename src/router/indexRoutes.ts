import { Router } from "express";
const mainRouter: Router = Router();

import userRoutes from "./userRoutes";
import roleRoutes from "./roleRoutes";
import permissionRoutes from "./permissionRoutes";

mainRouter
  .use(userRoutes)
  .use(roleRoutes)
  .use(permissionRoutes);

export default mainRouter;