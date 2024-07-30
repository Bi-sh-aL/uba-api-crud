/* eslint-disable @typescript-eslint/ban-ts-comment */
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../db.config";
import { User } from "../entity/User";
// import { Permission } from "../entity/Permission";


export const jwtauth = (req: Request, res: Response, next: NextFunction) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({ message: "Auth Error" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);

    // @ts-expect-error
    req.user = verified;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

//function to generate token
export const generateToken = <T extends object> (user: T) => {
  return jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: "1h" });
};

export const roleAuthorize = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    if ( !req.user ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      // @ts-expect-error
      where: { id: req.user.id },
      relations: ["role", "role.permissions"],
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    } 
    
    const userRoles = user.role.map((role) => role.name);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(401).json({ message: "Access denied" });
    }
    next();
  };
};


export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.id;
    const userRepo = AppDataSource.getRepository(User);
    // const permissionRepo = AppDataSource.getRepository(Permission);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["role", "role.permissions"],

    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasPermission = user.role.some(role => 
      role.permissions.some(permission => permission.name === requiredPermission)
    );

    if(!hasPermission) {
      return res.status(403).json({status: "Access Forbidden"});
    }

    next();
  };
};