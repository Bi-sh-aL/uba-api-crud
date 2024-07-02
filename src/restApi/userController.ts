import { Request, Response } from "express";
import userData from "../Mock_Data.json";
import fs from "fs/promises";
import path from "path";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const users: User[] = userData as User[];

export const getUsers = (req: Request, res: Response) => {
  return res.json(users);
};

export const getUserById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  if (user) {
    return res.status(201).json(user);
  } else {
    return res.status(404).json({ message: "404 User not found" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const body = req.body;
  // Check for duplicate email
  if (users.some((user) => user.email === body.email)) {
    return res.status(409).json({ status: "Email already exists." });
  }
  //Find the highest existing id
  const highestId =
      users.length > 0
        ? users.reduce((max, user) => (user.id > max ? user.id : max), 0)
        : 0;
    //Assign a new id
  const newId = highestId + 1;

  const newUser: User = { id: newId, ...body };
  users.push(newUser);
  try {
    await fs.writeFile(
      path.join("Mock_Data.json"),
      JSON.stringify(users, null, 2)
    );
    return res
      .status(201)
      .json({ status: "User added successfully", id: newUser.id });
  } catch (error) {
    return res.status(500).json({ status: "Failed to add user." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((user) => user.id == id);

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    try {
      // Check for duplicate email if email is being updated
      if (
        req.body.email &&
          users.some((user) => user.email === req.body.email && user.id !== id)
      ) {
        return res.status(409).json({ status: "Email already exists." });
      }
      await fs.writeFile(
        path.join(__dirname, "Mock_Data.json"),
        JSON.stringify(users, null, 2)
      );
      return res
        .status(200)
        .json({ status: `User with id ${id} updated successfully.` });
    } catch (error) {
      return res.status(500).json({ status: "Failed to update user." });
    }
  } else {
    return res.status(404).json({ message: "404 User not found" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    try {
      await fs.writeFile(
        path.join("Mock_Data.json"),
        JSON.stringify(users, null, 2)
      );
      return res
        .status(204)
        .json({ status: `User with id ${id} deleted successfully.` });
    } catch (error) {
      return res.status(500).json({ status: "Failed to update user." });
    }
  } else {
    return res.status(404).json({ message: "404 User not found" });
  }
};
