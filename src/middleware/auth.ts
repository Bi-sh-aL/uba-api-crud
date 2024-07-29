/* eslint-disable @typescript-eslint/ban-ts-comment */
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

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