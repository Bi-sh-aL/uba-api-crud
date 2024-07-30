import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, userLogin } from "../restApi/userController";
import validate from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validator/userValidator";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { jwtauth, checkPermission } from "../middleware/auth";

import { createInternship } from "../restApi/intern";

const router: Router = Router();


//routes to get all users
router.get("/users", jwtauth, checkPermission("get_users"), getUsers);

//route to create a new user
router.post("/users", validate(createUserSchema), createUser);

//route to get user by id
router.get("/users/:id", jwtauth,  getUserById);

//route to update existing user
router.patch("/users/:id", jwtauth, validate(updateUserSchema), updateUser);

//route to delete a user
router.delete("/users/:id", jwtauth, checkPermission("delete_users"), deleteUser);

//route for login
router.post("/users/login", userLogin);

router.post("/users/internships/:userId/", createInternship);

export default router;