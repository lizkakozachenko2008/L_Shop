import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { Cart, CartItem, AddToCartDTO, UpdateCartItemDTO } from "../types/Cart";
import { Product } from "../types/Product";
import { RequestWithUser } from "../types/RequestWithUser";
import { User } from "../types/User";

const CARTS_FILE = "carts.json";
const PRODUCTS_FILE = "products.json";

const getCarts = async (): Promise<Cart[]> => {
  try {
    return (await readJsonFile<Cart[]>(CARTS_FILE)) || [];
  } catch {
    return [];
  }
};

const saveCarts = async (carts: Cart[]): Promise<void> => {
  await writeJsonFile(CARTS_FILE, carts);
};

const getProducts = async (): Promise<Product[]> => {
  try {
    return (await readJsonFile<Product[]>(PRODUCTS_FILE)) || [];
  } catch {
    return [];
  }
};

export const getCart = async (req: RequestWithUser, res: Response) => {
  try {
    console.log('🔍 GET /api/cart — user:', req.user);
    
    const user = req.user as User | undefined;
    
    if (!user) {
      console.log('👤 Гость — пустая корзина');
      return res.json({ items: [], totalItems: 0 });
    }

    const carts = await getCarts();
    let cart = carts.find(c => c.userId === user.id);

    if (!cart) {
      cart = { id: uuidv4(), userId: user.id, items: [] };
      carts.push(cart);
      await saveCarts(carts);
    }

    const products = await getProducts();
    const cartWithDetails = cart.items
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean) as any[];

    res.json({ 
      items: cartWithDetails, 
      totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0)
    });

  } catch (error: any) {
    console.error("getCart ERROR:", error);
    res.status(500).json({ message: "Ошибка корзины" });
  }
};

export const addToCart = async (req: RequestWithUser<AddToCartDTO>, res: Response) => {
  try {
    const user = req.user as User | undefined;
    if (!user) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    const { productId, quantity = 1 } = req.body;

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
      cart = { id: uuidv4(), userId: user.id, items: [] };
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
  } catch (error: any) {
    console.error("addToCart ERROR:", error);
    res.status(500).json({ message: "Ошибка добавления в корзину" });
  }
};

export const updateCartItem = async (req: RequestWithUser<UpdateCartItemDTO>, res: Response) => {
  try {
    const user = req.user as User | undefined;
    if (!user) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: "Количество не может быть отрицательным" });
    }

    const carts = await getCarts();
    const cart = carts.find(c => c.userId === user.id);
    if (!cart) {
      return res.status(404).json({ message: "Корзина пуста" });
    }

    const item = cart.items.find(i => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: "Товар не в корзине" });
    }

    // Проверка остатка при обновлении
    if (quantity > 0) {
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      if (product && product.stock < quantity) {
        return res.status(400).json({ message: "Недостаточно товара на складе" });
      }
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await saveCarts(carts);
    res.json({ message: "Корзина обновлена" });
  } catch (error: any) {
    console.error("updateCartItem ERROR:", error);
    res.status(500).json({ message: "Ошибка обновления корзины" });
  }
};

export const removeFromCart = async (req: RequestWithUser, res: Response) => {
  try {
    const user = req.user as User | undefined;
    if (!user) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    const { productId } = req.params;

    const carts = await getCarts();
    const cart = carts.find(c => c.userId === user.id);
    if (!cart) {
      return res.status(404).json({ message: "Корзина пуста" });
    }

    cart.items = cart.items.filter(i => i.productId !== productId);
    await saveCarts(carts);

    res.json({ message: "Товар удалён из корзины" });
  } catch (error: any) {
    console.error("removeFromCart ERROR:", error);
    res.status(500).json({ message: "Ошибка удаления из корзины" });
  }
};

export const clearCart = async (userId: string) => {
  try {
    const carts = await getCarts();
    const index = carts.findIndex(c => c.userId === userId);
    if (index !== -1) {
      carts.splice(index, 1);
      await saveCarts(carts);
    }
  } catch (error: any) {
    console.error("clearCart ERROR:", error);
  }
};
