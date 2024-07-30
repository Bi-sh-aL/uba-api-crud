import { Router } from "express";
import { createPermission } from "../restApi/permission";

const router: Router = Router();

router.post("/permissions", createPermission);

export default router;