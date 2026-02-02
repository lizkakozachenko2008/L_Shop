import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "../utils/jsonUtils";
import { Order } from "../types/Order";
import { Product } from "../types/Product";
import { User } from "../types/User";
import { clearCart } from "./cartController"; 

const ORDERS_FILE = "orders.json";
const PRODUCTS_FILE = "products.json";

const getOrders = async () => await readJsonFile<Order[]>(ORDERS_FILE);
const saveOrders = async (orders: Order[]) => await writeJsonFile(ORDERS_FILE, orders);
const getProducts = async () => await readJsonFile<Product[]>(PRODUCTS_FILE);

export const createOrder = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const {
    deliveryAddress,
    deliveryPhone,
    deliveryEmail,
    paymentMethod
  }: {
    deliveryAddress: string;
    deliveryPhone: string;
    deliveryEmail: string;
    paymentMethod: string;
  } = req.body;

  if (!deliveryAddress || !deliveryPhone || !deliveryEmail || !paymentMethod) {
    return res.status(400).json({ message: "Заполните все поля доставки и оплаты" });
  }

  // Получаем корзину
  const carts = await readJsonFile<any[]>("carts.json"); // временно any, или импортируй Cart
  const cart = carts.find((c: any) => c.userId === user.id);
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Корзина пуста" });
  }

  const products = await getProducts();

  // Рассчитываем итог и фиксируем цены
  let totalAmount = 0;
  const orderItems = cart.items.map((item: any) => {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error("Товара нет в наличии");
    }
    totalAmount += product.price * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: product.price
    };
  });

  const newOrder: Order = {
    id: uuidv4(),
    userId: user.id,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    deliveryPhone,
    deliveryEmail,
    paymentMethod,
    createdAt: Date.now()
  };

  const orders = await getOrders();
  orders.push(newOrder);
  await saveOrders(orders);

  // Очищаем корзину после успешного заказа
  await clearCart(user.id);

  res.status(201).json({ message: "Заказ оформлен успешно", order: newOrder });
};

export const getUserOrders = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const orders = await getOrders();
  const userOrders = orders.filter(o => o.userId === user.id);
  res.json(userOrders);
};