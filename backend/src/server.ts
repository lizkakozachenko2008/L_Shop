import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import setupSwagger from "./swagger";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

// API роуты
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Корневой роут в конце
app.get("/", (req, res) => {
  res.json({ message: "Lunar Glow Backend Running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}/api/cart `);
});
