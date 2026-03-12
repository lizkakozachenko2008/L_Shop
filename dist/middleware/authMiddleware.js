"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonUtils_1 = require("../utils/jsonUtils");
const USERS_FILE = "users.json";
const authMiddleware = async (req, res, next) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return res.status(401).json({ message: "Нет авторизации" });
    }
    const users = await (0, jsonUtils_1.readJsonFile)(USERS_FILE);
    const user = users.find((u) => u.sessionId === sessionId && u.sessionExpires && u.sessionExpires > Date.now());
    if (!user) {
        res.clearCookie("sessionId");
        return res.status(401).json({ message: "Сессия истекла или недействительна" });
    }
    // сессия 10 мин
    user.sessionExpires = Date.now() + 10 * 60 * 1000;
    await (0, jsonUtils_1.writeJsonFile)(USERS_FILE, users);
    req.user = user;
    next();
};
exports.authMiddleware = authMiddleware;
