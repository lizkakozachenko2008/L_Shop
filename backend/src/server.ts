import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
const app = express();
const PORT = 5000;

// Глобальные middleware
app.use(cors({ 
  origin: "http://localhost:3000", // НЕ ЗАБЫТЬ ЗАМЕНИТЬ на порт фронта
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Тестовый health-check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running!" });
});

// авторизация
app.use("/api/auth", authRoutes);
//продукты
app.use("/api/products", productRoutes);
// корневой роут
app.get("/", (req, res) => {
  res.send("Lunar Glow Backend Running!");
});
// корзина
app.use("/api/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});