export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    priceAtPurchase: number; // цена на момент заказа
  }[];
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryEmail: string;
  paymentMethod: string; // "card","cash",etc.
  createdAt: number; // timestamp
  status?: string; // "new","processing","delivered" 
}