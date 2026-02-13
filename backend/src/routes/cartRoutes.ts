import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware); 

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:productId", updateCartItem);
router.delete("/remove/:productId", removeFromCart);

export default router;