/* eslint-disable @typescript-eslint/ban-ts-comment */
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../db.config";
import { User } from "../entity/User";


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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // @ts-expect-error
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

//function to generate token
export const generateToken = <T extends object> (user: T) => {
  return jwt.sign(user, process.env.JWT_SECRET as string);
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