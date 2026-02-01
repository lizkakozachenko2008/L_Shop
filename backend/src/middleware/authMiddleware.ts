import { Request, Response, NextFunction } from "express";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { User } from "../types/User";

const USERS_FILE = "users.json";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId as string | undefined;

  if (!sessionId) {
    return res.status(401).json({ message: "Нет авторизации" });
  }

  const users = await readJsonFile<User[]>(USERS_FILE);
  const user = users.find(
    (u) => u.sessionId === sessionId && u.sessionExpires && u.sessionExpires > Date.now()
  );

  if (!user) {
    res.clearCookie("sessionId");
    return res.status(401).json({ message: "Сессия истекла или недействительна" });
  }

  // сессия 10 мин
  user.sessionExpires = Date.now() + 10 * 60 * 1000;
  await writeJsonFile(USERS_FILE, users);

  (req as any).user = user; 
  next();
};