"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID товара
 *         quantity:
 *           type: integer
 *           description: Количество
 *           minimum: 1
 *         price:
 *           type: number
 *           description: Цена за единицу
 *         total:
 *           type: number
 *           description: Общая стоимость позиции
 *       example:
 *         productId: "prod_123456"
 *         quantity: 2
 *         price: 2500
 *         total: 5000
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID заказа
 *         userId:
 *           type: string
 *           description: ID пользователя
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *           description: Общая сумма заказа
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *           description: Статус заказа
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "order_123456"
 *         userId: "user_123"
 *         items: [
 *           {
 *             productId: "prod_123456",
 *             quantity: 2,
 *             price: 2500,
 *             total: 5000
 *           }
 *         ]
 *         totalAmount: 5000
 *         status: "pending"
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-15T10:30:00Z"
 */
/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     summary: Создать новый заказ
 *     tags: [Orders]
 *     description: Создает заказ из текущей корзины пользователя
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Корзина пуста или ошибка в данных
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Корзина пуста"
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Требуется авторизация"
 *       500:
 *         description: Ошибка сервера
 */
router.post("/create", orderController_1.createOrder);
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получить заказы текущего пользователя
 *     tags: [Orders]
 *     description: Возвращает список всех заказов пользователя
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", orderController_1.getUserOrders);
exports.default = router;
