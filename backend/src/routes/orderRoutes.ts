import { Router } from "express";
import { createOrder, getUserOrders } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/create", createOrder);
router.get("/", getUserOrders);

export default router;