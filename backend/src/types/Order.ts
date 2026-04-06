export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number; // цена на момент заказа
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryEmail: string;
  paymentMethod: string; // "card","cash",etc.
  createdAt: number; // timestamp
  status?: string; // "new","processing","delivered"
}

export interface CreateOrderDTO {
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryEmail: string;
  paymentMethod: string;
  selectedItems?: string[];
}
