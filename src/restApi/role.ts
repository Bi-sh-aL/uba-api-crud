import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
import { Role } from "../entity/Role";
// import { Permission } from "../entity/Permission";

export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;

  if(!name) {
    return res.status(400).json({ status: "Role name is required" });
  }

  const roleRepository = AppDataSource.getRepository(Role);
  const role = roleRepository.create( {name} );

  await roleRepository.save(role);

  return res.status(201).json({message: "Role created successfully", role});
};