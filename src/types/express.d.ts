import { Request } from "express";

declare module "express" {
  interface AuthenticatedRequest<T> extends Request {
    user?: T;
  }
}