import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { Order } from "../types/Order";
import { Product } from "../types/Product";
import { User } from "../types/User";
import { Cart } from "../types/Cart";

const ORDERS_FILE = "orders.json";
const PRODUCTS_FILE = "products.json";
const CARTS_FILE = "carts.json";

const getOrders = async () => await readJsonFile<Order[]>(ORDERS_FILE);
const saveOrders = async (orders: Order[]) => await writeJsonFile(ORDERS_FILE, orders);
const getProducts = async () => await readJsonFile<Product[]>(PRODUCTS_FILE);
const saveProducts = async (products: Product[]) => await writeJsonFile(PRODUCTS_FILE, products);
const getCarts = async () => await readJsonFile<Cart[]>(CARTS_FILE);
const saveCarts = async (carts: Cart[]) => await writeJsonFile(CARTS_FILE, carts);

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const {
      deliveryAddress,
      deliveryPhone,
      deliveryEmail,
      paymentMethod,
      selectedItems // ✅ ПОЛУЧАЕМ ВЫБРАННЫЕ ТОВАРЫ ИЗ ТЕЛА ЗАПРОСА
    }: {
      deliveryAddress: string;
      deliveryPhone: string;
      deliveryEmail: string;
      paymentMethod: string;
      selectedItems?: string[]; // ✅ МАССИВ ID ВЫБРАННЫХ ТОВАРОВ
    } = req.body;

    if (!deliveryAddress || !deliveryPhone || !deliveryEmail || !paymentMethod) {
      return res.status(400).json({ message: "Заполните все поля доставки и оплаты" });
    }

    // Получаем корзину пользователя
    const carts = await getCarts();
    const cart = carts.find((c: Cart) => c.userId === user.id);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Корзина пуста" });
    }

    // ✅ Если selectedItems не передан, берем все товары из корзины
    const itemsToOrder = selectedItems && selectedItems.length > 0
      ? cart.items.filter(item => selectedItems.includes(item.productId))
      : cart.items;

    if (itemsToOrder.length === 0) {
      return res.status(400).json({ message: "Не выбраны товары для заказа" });
    }

    const products = await getProducts();
    const orderItems = [];
    let totalAmount = 0;

    // ✅ 1. Проверяем наличие и резервируем ТОЛЬКО ВЫБРАННЫЕ товары
    for (const item of itemsToOrder) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Товар с ID ${item.productId} не найден` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `❌ Недостаточно товара "${product.title}" в наличии. Доступно: ${product.stock}, в корзине: ${item.quantity}` 
        });
      }

      // ✅ 2. УМЕНЬШАЕМ КОЛИЧЕСТВО НА СКЛАДЕ
      product.stock -= item.quantity;
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
      
      totalAmount += product.price * item.quantity;
    }

    // ✅ 3. СОХРАНЯЕМ ОБНОВЛЕННЫЕ ТОВАРЫ
    await saveProducts(products);

    // ✅ 4. Создаем заказ
    const newOrder: Order = {
      id: uuidv4(),
      userId: user.id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      deliveryPhone,
      deliveryEmail,
      paymentMethod,
      createdAt: Date.now(),
      status: "new"
    };

    const orders = await getOrders();
    orders.push(newOrder);
    await saveOrders(orders);

    // ✅ 5. УДАЛЯЕМ ТОЛЬКО ВЫБРАННЫЕ ТОВАРЫ ИЗ КОРЗИНЫ
    const remainingItems = cart.items.filter(
      item => !itemsToOrder.some(ordered => ordered.productId === item.productId)
    );
    
    cart.items = remainingItems;
    await saveCarts(carts);

    // ✅ 6. Отправляем успешный ответ
    res.status(201).json({ 
      message: "✅ Заказ оформлен успешно! Выбранные товары списаны со склада и удалены из корзины.",
      order: {
        id: newOrder.id,
        totalAmount: newOrder.totalAmount,
        itemsCount: newOrder.items.length,
        createdAt: newOrder.createdAt
      },
      remainingCartItems: remainingItems.length // Сколько товаров осталось в корзине
    });

  } catch (error: any) {
    console.error("❌ createOrder ERROR:", error);
    res.status(500).json({ 
      message: error.message || "Ошибка при оформлении заказа" 
    });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const orders = await getOrders();
    const userOrders = orders
      .filter(o => o.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(userOrders);
  } catch (error: any) {
    console.error("❌ getUserOrders ERROR:", error);
    res.status(500).json({ message: "Ошибка получения заказов" });
  }
};