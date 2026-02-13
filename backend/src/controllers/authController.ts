import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { User } from "../types/User";
import { RegisterDTO } from "../types/RegisterDTO";
import { LoginDTO } from "../types/LoginDTO";

const USERS_FILE = "users.json";

const getUsers = async () => await readJsonFile<User[]>(USERS_FILE);
const saveUsers = async (users: User[]) => await writeJsonFile(USERS_FILE, users);

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password }: RegisterDTO = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Заполните обязательные поля" });
  }

  const users = await getUsers();

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: "Email уже занят" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    phone,
    passwordHash,
  };

  users.push(newUser);
  await saveUsers(users);

  await createSession(newUser, res);

  res.status(201).json({
    message: "Регистрация успешна",
    user: { id: newUser.id, name, email },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginDTO = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Заполните поля" });
  }

  const users = await getUsers();
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  await createSession(user, res);

  res.json({
    message: "Логин успешен",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

const createSession = async (user: User, res: Response) => {
  const sessionId = uuidv4();
  const sessionExpires = Date.now() + 10 * 60 * 1000; // 10 минут

  const users = await getUsers();
  const updated = users.find(u => u.id === user.id);
  if (updated) {
    updated.sessionId = sessionId;
    updated.sessionExpires = sessionExpires;
    await saveUsers(users);
  }

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: false, // в продакшене true с HTTPS
    sameSite: "strict",
    maxAge: 10 * 60 * 1000,
  });
};

export const me = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (!user) return res.status(401).json({ message: "Не авторизован" });

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
};

export const logout = async (req: Request, res: Response) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    const users = await getUsers();
    const user = users.find(u => u.sessionId === sessionId);
    if (user) {
      delete user.sessionId;
      delete user.sessionExpires;
      await saveUsers(users);
    }
  }

  res.clearCookie("sessionId");
  res.json({ message: "Выход выполнен" });
};