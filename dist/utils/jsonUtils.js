"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsonFile = exports.readJsonFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Абсолютный путь к папке data (от корня проекта)
const DATA_DIR = path_1.default.join(process.cwd(), "backend", "data");
// Создаём папку, если её нет (при первом запуске)
fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
const readJsonFile = async (filename) => {
    const filePath = path_1.default.join(DATA_DIR, filename);
    if (!fs_1.default.existsSync(filePath)) {
        return []; // если файла нет — пустой массив (для users, products и т.д.)
    }
    const data = await fs_1.default.promises.readFile(filePath, "utf-8");
    return JSON.parse(data);
};
exports.readJsonFile = readJsonFile;
const writeJsonFile = async (filename, data) => {
    const filePath = path_1.default.join(DATA_DIR, filename);
    await fs_1.default.promises.writeFile(filePath, JSON.stringify(data, null, 2));
};
exports.writeJsonFile = writeJsonFile;
