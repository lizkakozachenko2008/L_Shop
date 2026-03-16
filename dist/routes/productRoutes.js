"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *         name:
 *           type: string
 *           description: Название товара
 *         price:
 *           type: number
 *           description: Цена товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         image:
 *           type: string
 *           description: URL изображения товара
 *         inStock:
 *           type: boolean
 *           description: Наличие товара на складе
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата добавления товара
 *       example:
 *         id: "prod_123456"
 *         name: "Увлажняющий крем"
 *         price: 2500
 *         description: "Крем для интенсивного увлажнения кожи"
 *         category: "Уход за кожей"
 *         image: "https://example.com/cream.jpg"
 *         inStock: true
 *         createdAt: "2024-01-15T10:30:00Z"
 */
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     description: Возвращает массив всех товаров в магазине
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ошибка при получении товаров"
 */
router.get("/", productController_1.getProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     description: Возвращает один товар по его уникальному идентификатору
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: "prod_123456"
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Товар не найден"
 *       400:
 *         description: Неверный формат ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Неверный ID товара"
 */
router.get("/:id", productController_1.getProductById);
exports.default = router;
