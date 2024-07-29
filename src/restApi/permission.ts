import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
import { Role } from "../entity/Role";
import { Permission } from "../entity/Permission";  

export const createPermission = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {        
    return res.status(400).json({ status: "Permission name is required" });
  }

  const permissionRepo = AppDataSource.getRepository(Permission);
  const permission = permissionRepo.create({ name });
  await permissionRepo.save(permission);

  return res.status(201).json({message: "Permission created successfully", permission});
};

export const addPermissionToRole = async (req: Request, res: Response) => {
  const  roleId  = parseInt(req.params.roleId, 10);
  const { permissionIds }: { permissionIds: number[] } = req.body;

  if(isNaN(roleId)) {
    return res.status(400).json({ status: "Invalid role id" });
  }

  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return res.status(400).json({ status: "Invalid permissions list" });
  }

  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  const role = await roleRepository.findOneBy({ id: roleId });

  if (!role) {
    return res.status(404).json({ status: "Role not found" });
  }

  const permission = await permissionRepository.findByIds(permissionIds);
    
  if (!permission) {
    return res.status(404).json({ status: "Permission not found" });
  }

  role.permissions = permission;

  await roleRepository.save(role);
};