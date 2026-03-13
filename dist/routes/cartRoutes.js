"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cartRoutes.ts
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ✅ Добавляем middleware к GET
router.get("/", authMiddleware_1.authMiddleware, cartController_1.getCart); // ← ТЕПЕРЬ БУДЕТ ПОЛУЧАТЬ user!
// Остальные маршруты
router.post("/add", authMiddleware_1.authMiddleware, cartController_1.addToCart);
router.put("/update/:productId", authMiddleware_1.authMiddleware, cartController_1.updateCartItem);
router.delete("/remove/:productId", authMiddleware_1.authMiddleware, cartController_1.removeFromCart);
exports.default = router;
