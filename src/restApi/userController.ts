import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/auth";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ status: "Failed to fetch users." });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ status: "Failed to fetch user." });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({where: { email: body.email }});
    if (existingUser) {
      return res.status(409).json({ status: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = userRepository.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword
    });
    
    await userRepository.save(newUser);

    const payload = {
      id: newUser.id,
      email: newUser.email
    };

    const token = generateToken(payload);
    
    return res.status(201).json({ status: "User added successfully", token });

    
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ status: "Failed to add user." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id });
    if (user) {
      if (body.email && body.email !== user.email) {
        const existingUser = await userRepository.findOneBy({ email: body.email });
        if (existingUser) {
          return res.status(409).json({ status: "Email already exists." });
        }
      }

      // Hash the new password if it is provided in the body
      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      }

      userRepository.merge(user, body);
      await userRepository.save(user);
      return res.status(200).json({ status: `User with id ${id} updated successfully.` });
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ status: "Failed to update user." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id });
    if (user) {
      await userRepository.remove(user);
      return res.status(204).json({ status: `User with id ${id} deleted successfully.` });
    } else {
      return res.status(404).json({ message: "404 User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ status: "Failed to delete user." });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ status: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json({ status: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      email: user.email
    };  

    const token = generateToken(payload);
    return res.status(200).json({ status: "Login successful", token: token });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ status: "Failed to login" });
  }
};
