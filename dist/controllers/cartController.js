"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const jsonUtils_1 = require("../utils/jsonUtils");
const CARTS_FILE = "carts.json";
const PRODUCTS_FILE = "products.json";
const getCarts = async () => {
    try {
        return (await (0, jsonUtils_1.readJsonFile)(CARTS_FILE)) || [];
    }
    catch {
        return [];
    }
};
const saveCarts = async (carts) => {
    await (0, jsonUtils_1.writeJsonFile)(CARTS_FILE, carts);
};
const getProducts = async () => {
    try {
        return (await (0, jsonUtils_1.readJsonFile)(PRODUCTS_FILE)) || [];
    }
    catch {
        return [];
    }
};
const getCart = async (req, res) => {
    try {
        console.log('🔍 GET /api/cart — user:', req.user);
        const user = req.user;
        if (!user) {
            console.log('👤 Гость — пустая корзина');
            return res.json({ items: [], totalItems: 0 });
        }
        const carts = await getCarts();
        let cart = carts.find(c => c.userId === user.id);
        if (!cart) {
            cart = { userId: user.id, items: [] };
            carts.push(cart);
            await saveCarts(carts);
        }
        const products = await getProducts();
        const cartWithDetails = cart.items
            .map(item => {
            const product = products.find(p => p.id === item.productId);
            return product ? { ...item, product } : null;
        })
            .filter(Boolean);
        res.json({
            items: cartWithDetails,
            totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0)
        });
    }
    catch (error) {
        console.error("getCart ERROR:", error);
        res.status(500).json({ message: "Ошибка корзины" });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const { productId, quantity = 1 } = req.body;
        if (!productId || quantity < 1) {
            return res.status(400).json({ message: "Неверные данные" });
        }
        const products = await getProducts();
        const product = products.find(p => p.id === productId);
        if (!product || product.stock < quantity) {
            return res.status(400).json({ message: "Товара нет в наличии" });
        }
        const carts = await getCarts();
        let cart = carts.find(c => c.userId === user.id);
        if (!cart) {
            cart = { userId: user.id, items: [] };
            carts.push(cart);
        }
        const existingItem = cart.items.find(i => i.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({ productId, quantity });
        }
        await saveCarts(carts);
        res.json({ message: "Добавлено в корзину" });
    }
    catch (error) {
        console.error("addToCart ERROR:", error);
        res.status(500).json({ message: "Ошибка добавления в корзину" });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const { productId } = req.params;
        const { quantity } = req.body;
        if (quantity < 0) {
            return res.status(400).json({ message: "Количество не может быть отрицательным" });
        }
        const carts = await getCarts();
        const cart = carts.find(c => c.userId === user.id);
        if (!cart) {
            return res.status(404).json({ message: "Корзина пуста" });
        }
        const item = cart.items.find(i => i.productId === productId);
        if (!item) {
            return res.status(404).json({ message: "Товар не в корзине" });
        }
        // Проверка остатка при обновлении
        if (quantity > 0) {
            const products = await getProducts();
            const product = products.find(p => p.id === productId);
            if (product && product.stock < quantity) {
                return res.status(400).json({ message: "Недостаточно товара на складе" });
            }
        }
        if (quantity === 0) {
            cart.items = cart.items.filter(i => i.productId !== productId);
        }
        else {
            item.quantity = quantity;
        }
        await saveCarts(carts);
        res.json({ message: "Корзина обновлена" });
    }
    catch (error) {
        console.error("updateCartItem ERROR:", error);
        res.status(500).json({ message: "Ошибка обновления корзины" });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Необходима авторизация" });
        }
        const { productId } = req.params;
        const carts = await getCarts();
        const cart = carts.find(c => c.userId === user.id);
        if (!cart) {
            return res.status(404).json({ message: "Корзина пуста" });
        }
        cart.items = cart.items.filter(i => i.productId !== productId);
        await saveCarts(carts);
        res.json({ message: "Товар удалён из корзины" });
    }
    catch (error) {
        console.error("removeFromCart ERROR:", error);
        res.status(500).json({ message: "Ошибка удаления из корзины" });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (userId) => {
    try {
        const carts = await getCarts();
        const index = carts.findIndex(c => c.userId === userId);
        if (index !== -1) {
            carts.splice(index, 1);
            await saveCarts(carts);
        }
    }
    catch (error) {
        console.error("clearCart ERROR:", error);
    }
};
exports.clearCart = clearCart;
