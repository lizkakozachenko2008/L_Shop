import { Request, Response } from "express";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { Cart, CartItem } from "../types/Cart";
import { Product } from "../types/Product";
import { User } from "../types/User";

const CARTS_FILE = "carts.json";
const PRODUCTS_FILE = "products.json";

const getCarts = async () => await readJsonFile<Cart[]>(CARTS_FILE);
const saveCarts = async (carts: Cart[]) => await writeJsonFile(CARTS_FILE, carts);
const getProducts = async () => await readJsonFile<Product[]>(PRODUCTS_FILE);

export const getCart = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const carts = await getCarts();
  let cart = carts.find(c => c.userId === user.id);

  if (!cart) {
    cart = { userId: user.id, items: [] };
    carts.push(cart);
    await saveCarts(carts);
  }

  const products = await getProducts();
  const cartWithDetails = cart.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  res.json({ items: cartWithDetails, totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0) });
};

export const addToCart = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId, quantity = 1 }: { productId: string; quantity?: number } = req.body;

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
  } else {
    cart.items.push({ productId, quantity });
  }

  await saveCarts(carts);
  res.json({ message: "Добавлено в корзину" });
};

export const updateCartItem = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId } = req.params;
  const { quantity }: { quantity: number } = req.body;

  if (quantity < 0) return res.status(400).json({ message: "Количество не может быть отрицательным" });

  const carts = await getCarts();
  const cart = carts.find(c => c.userId === user.id);
  if (!cart) return res.status(404).json({ message: "Корзина пуста" });

  const item = cart.items.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ message: "Товар не в корзине" });

  if (quantity === 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  await saveCarts(carts);
  res.json({ message: "Корзина обновлена" });
};

export const removeFromCart = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId } = req.params;

  const carts = await getCarts();
  const cart = carts.find(c => c.userId === user.id);
  if (!cart) return res.status(404).json({ message: "Корзина пуста" });

  cart.items = cart.items.filter(i => i.productId !== productId);
  await saveCarts(carts);

  res.json({ message: "Товар удалён из корзины" });
};

export const clearCart = async (userId: string) => {
  const carts = await getCarts();
  const index = carts.findIndex(c => c.userId === userId);
  if (index !== -1) {
    carts.splice(index, 1);
    await saveCarts(carts);
  }
};