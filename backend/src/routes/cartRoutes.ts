// cartRoutes.ts
import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID товара
 *         quantity:
 *           type: integer
 *           description: Количество
 *           minimum: 1
 *         product:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             price:
 *               type: number
 *             image:
 *               type: string
 *       example:
 *         productId: "prod_123456"
 *         quantity: 2
 *         product: {
 *           name: "Увлажняющий крем",
 *           price: 2500,
 *           image: "https://example.com/cream.jpg"
 *         }
 *     
 *     Cart:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID пользователя
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalPrice:
 *           type: number
 *           description: Общая стоимость корзины
 *         totalItems:
 *           type: integer
 *           description: Общее количество товаров
 *       example:
 *         userId: "user_123"
 *         items: [
 *           {
 *             productId: "prod_123456",
 *             quantity: 2,
 *             product: {
 *               name: "Увлажняющий крем",
 *               price: 2500,
 *               image: "https://example.com/cream.jpg"
 *             }
 *           }
 *         ]
 *         totalPrice: 5000
 *         totalItems: 2
 *     
 *     AddToCartRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: ID товара
 *         quantity:
 *           type: integer
 *           description: Количество
 *           minimum: 1
 *       example:
 *         productId: "prod_123456"
 *         quantity: 2
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Получить корзину пользователя
 *     tags: [Cart]
 *     description: Возвращает текущую корзину авторизованного пользователя
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Корзина пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
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
router.get("/", authMiddleware, getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Добавить товар в корзину
 *     tags: [Cart]
 *     description: Добавляет товар в корзину или увеличивает его количество
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: Товар добавлен в корзину
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Ошибка в запросе или недостаточно товара
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Недостаточно товара на складе"
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
router.post("/add", authMiddleware, addToCart);

/**
 * @swagger
 * /api/cart/update/{productId}:
 *   put:
 *     summary: Обновить количество товара в корзине
 *     tags: [Cart]
 *     description: Изменяет количество конкретного товара в корзине
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: "prod_123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Новое количество товара
 *             example:
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Количество обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Недостаточно товара на складе
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден в корзине
 */
router.put("/update/:productId", authMiddleware, updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Удалить товар из корзины
 *     tags: [Cart]
 *     description: Полностью удаляет товар из корзины
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *         example: "prod_123456"
 *     responses:
 *       200:
 *         description: Товар удален из корзины
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден в корзине
 */
router.delete("/remove/:productId", authMiddleware, removeFromCart);

export default router; 