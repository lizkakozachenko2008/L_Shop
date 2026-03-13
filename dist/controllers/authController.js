"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.login = exports.register = void 0;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonUtils_1 = require("../utils/jsonUtils");
const USERS_FILE = "users.json";
const getUsers = async () => await (0, jsonUtils_1.readJsonFile)(USERS_FILE);
const saveUsers = async (users) => await (0, jsonUtils_1.writeJsonFile)(USERS_FILE, users);
const register = async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Заполните обязательные поля" });
    }
    const users = await getUsers();
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: "Email уже занят" });
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const newUser = {
        id: (0, uuid_1.v4)(),
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
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Заполните поля" });
    }
    const users = await getUsers();
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: "Неверный email или пароль" });
    }
    await createSession(user, res);
    res.json({
        message: "Логин успешен",
        user: { id: user.id, name: user.name, email: user.email },
    });
};
exports.login = login;
const createSession = async (user, res) => {
    const sessionId = (0, uuid_1.v4)();
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
const me = async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: "Не авторизован" });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
};
exports.me = me;
const logout = async (req, res) => {
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
exports.logout = logout;
