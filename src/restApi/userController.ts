import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/auth";
import { Role } from "../entity/Role";


//Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({ relations: ["role", "roles.permission" ]});
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ status: "Failed to fetch users." });
  }
};

//Get user by id
export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where: { id }, relations: ["role", "roles.permission" ]});
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

//Create a new user
export const createUser = async (req: Request, res: Response) => {
  
  try {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const body = req.body;
    const role = body.role;
    const existingEmail = await userRepository.findOne({where: { email: body.email }});
    const existingUsername = await userRepository.findOne({where: { username: body.username }});
    if (existingEmail) {
      return res.status(409).json({ status: "Email already exists." });
    }
    if (existingUsername) {
      return res.status(409).json({ status: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const roleEntities= await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role.map(async (value: { id: any; }) => {
        const roleEntity = await roleRepository.findOne({ where: {id: value.id }});
        if (!roleEntity) {
          throw new Error(`Role with id ${value.id} not found`);
        }
        return roleEntity;
      })
    );

    const newUser = userRepository.create({
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      mobileNumber: body.mobileNumber,
      email: body.email,
      password: hashedPassword,
      role: roleEntities
    });
    
    await userRepository.save(newUser);

    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: roleEntities
    };

    const token = generateToken(payload);
    
    return res.status(201).json({ status: "User added successfully", token });

    
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ status: "Failed to add user." });
  }
};

//Update exiting user
export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where: { id }, relations: ["role"]});
    if (user) {
      if (body.email && body.email !== user.email) {
        const existingUser = await userRepository.findOneBy({ email: body.email });
        if (existingUser) {
          return res.status(409).json({ status: "Email already exists." });
        }
      }

      if (body.username && body.username !== user.username) {
        const existingUser = await userRepository.findOneBy({ username: body.username });
        if (existingUser) {
          return res.status(409).json({ status: "Username already exists." });
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

//Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where: { id }});
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

//Handle user login
export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email }, relations: ["role", "role.permissions"] });
    
    if (!user) {
      return res.status(401).json({ status: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json({ status: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.map((role) => role.name),
    };  

    const token = generateToken(payload);
    return res.status(200).json({ status: "Login successful", token: token });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ status: "Failed to login" });
  }
};
