import fs from "fs";
import path from "path";

/**
 * Абсолютный путь к папке data (от корня проекта)
 * @constant {string}
 */
const DATA_DIR = path.join(process.cwd(), "backend", "data");

// Создаём папку, если её нет (при первом запуске)
fs.mkdirSync(DATA_DIR, { recursive: true });

/**
 * Читает JSON файл и возвращает его содержимое
 * @template T - Тип данных, которые ожидаются в файле
 * @param {string} filename - Имя файла (например: "users.json", "products.json")
 * @returns {Promise<T>} Промис с данными из файла
 * @throws {SyntaxError} Если файл содержит некорректный JSON
 * 
 * @example
 * // Прочитать пользователей
 * const users = await readJsonFile<User[]>('users.json');
 * 
 * @example
 * // Прочитать товары
 * const products = await readJsonFile<Product[]>('products.json');
 */
export const readJsonFile = async <T>(filename: string): Promise<T> => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [] as T; // если файла нет — пустой массив (для users, products и т.д.)
  }
  const data = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

/**
 * Записывает данные в JSON файл
 * @template T - Тип данных для записи
 * @param {string} filename - Имя файла (например: "users.json", "products.json")
 * @param {T} data - Данные для записи в файл
 * @returns {Promise<void>} Промис, который завершается после записи
 * @throws {Error} Если нет прав на запись или диск переполнен
 * 
 * @example
 * // Сохранить пользователей
 * await writeJsonFile<User[]>('users.json', updatedUsers);
 * 
 * @example
 * // Сохранить один заказ
 * await writeJsonFile<Order>('order-123.json', newOrder);
 */
export const writeJsonFile = async <T>(filename: string, data: T): Promise<void> => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
};
