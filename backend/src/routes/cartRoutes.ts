// cartRoutes.ts
import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// ✅ Добавляем middleware к GET
router.get("/", authMiddleware, getCart);  // ← ТЕПЕРЬ БУДЕТ ПОЛУЧАТЬ user!

// Остальные маршруты
router.post("/add", authMiddleware, addToCart);
router.put("/update/:productId", authMiddleware, updateCartItem);
router.delete("/remove/:productId", authMiddleware, removeFromCart);

export default router;