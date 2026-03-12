"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const swagger_1 = __importDefault(require("./swagger"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, swagger_1.default)(app);
// API роуты
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.get("/api/health", (req, res) => res.json({ status: "OK" }));
// Корневой роут в конце
app.get("/", (req, res) => {
    res.json({ message: "Lunar Glow Backend Running!" });
});
app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}/api/cart `);
});
