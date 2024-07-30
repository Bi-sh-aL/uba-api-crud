import { Router } from "express";
import { createRole } from "../restApi/role";
import { addPermissionToRole } from "../restApi/permission";

const router: Router = Router();

router.post("/roles", createRole);
router.post("/roles/:roleId/permissions", addPermissionToRole);

export default router;