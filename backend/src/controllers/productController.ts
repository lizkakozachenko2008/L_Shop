import { Request, Response } from "express";
import { readJsonFile } from "../utils/jsonUtils";
import { Product } from "../types/Product";

const PRODUCTS_FILE = "products.json";

export const getProducts = async (req: Request, res: Response) => {
  const products: Product[] = await readJsonFile<Product[]>(PRODUCTS_FILE);

  let filtered = [...products];

  // Поиск по title/description
  const search = req.query.search as string;
  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter(
      p => p.title.toLowerCase().includes(lowerSearch) || 
           p.description.toLowerCase().includes(lowerSearch)
    );
  }

  // Фильтр по категории
  const category = req.query.category as string;
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // Фильтр по наличию
  const inStock = req.query.inStock as string;
  if (inStock === "true") {
    filtered = filtered.filter(p => p.stock > 0);
  } else if (inStock === "false") {
    filtered = filtered.filter(p => p.stock === 0);
  }

  // Сортировка по цене
  const sort = req.query.sort as string;
  if (sort === "price_asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Пагинация (опционально, но полезно)
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
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

export const getProductById = async (req: Request, res: Response) => {
  const products: Product[] = await readJsonFile<Product[]>(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Товар не найден" });
  res.json(product);
};