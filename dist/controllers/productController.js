"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.getProducts = void 0;
const jsonUtils_1 = require("../utils/jsonUtils");
const PRODUCTS_FILE = "products.json";
const getProducts = async (req, res) => {
    const products = await (0, jsonUtils_1.readJsonFile)(PRODUCTS_FILE);
    let filtered = [...products];
    // Поиск по title/description
    const search = req.query.search;
    if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(lowerSearch) ||
            p.description.toLowerCase().includes(lowerSearch));
    }
    // Фильтр по категории
    const category = req.query.category;
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    // Фильтр по наличию
    const inStock = req.query.inStock;
    if (inStock === "true") {
        filtered = filtered.filter(p => p.stock > 0);
    }
    else if (inStock === "false") {
        filtered = filtered.filter(p => p.stock === 0);
    }
    // Сортировка по цене
    const sort = req.query.sort;
    if (sort === "price_asc") {
        filtered.sort((a, b) => a.price - b.price);
    }
    else if (sort === "price_desc") {
        filtered.sort((a, b) => b.price - a.price);
    }
    // Пагинация (опционально, но полезно)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    res.json({
        products: paginated,
        total: filtered.length,
        page,
        limit
    });
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    const products = await (0, jsonUtils_1.readJsonFile)(PRODUCTS_FILE);
    const product = products.find(p => p.id === req.params.id);
    if (!product)
        return res.status(404).json({ message: "Товар не найден" });
    res.json(product);
};
exports.getProductById = getProductById;
