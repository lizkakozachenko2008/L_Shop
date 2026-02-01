import fs from "fs";
import path from "path";

// Абсолютный путь к папке data (от корня проекта)
const DATA_DIR = path.join(process.cwd(), "backend", "data");

// Создаём папку, если её нет (при первом запуске)
fs.mkdirSync(DATA_DIR, { recursive: true });

export const readJsonFile = async <T>(filename: string): Promise<T> => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [] as T; // если файла нет — пустой массив (для users, products и т.д.)
  }
  const data = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

export const writeJsonFile = async <T>(filename: string, data: T): Promise<void> => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
};