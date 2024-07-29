import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, userLogin } from "../restApi/userController";
import validate from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validator/userValidator";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { jwtauth } from "../middleware/auth";

import { createInternship } from "../restApi/intern";

const router = Router();

router.get("/users", getUsers);
router.post("/users", validate(createUserSchema), createUser);
router.get("/users/:id", getUserById);
router.patch("/users/:id", validate(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);

router.post("/users/login", jwtauth, userLogin);

router.post("/users/internships/:userId/", createInternship);

export default router;