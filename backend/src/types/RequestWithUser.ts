import { Request } from "express";
import { User } from "./User";

export interface RequestWithUser<T = any> extends Request {
  user?: User;
  body: T;
}
