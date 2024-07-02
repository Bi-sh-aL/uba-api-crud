import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../restApi/userController";
import validate from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validator/userValidator";

const router = Router();

router.get("/users", getUsers);
router.post("/users", validate(createUserSchema), createUser);
router.get("/users/:id", getUserById);
router.patch("/users/:id", validate(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);

export default router;