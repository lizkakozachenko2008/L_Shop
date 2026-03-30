export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    priceAtPurchase: number; 
  }[];
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryEmail: string;
  paymentMethod: string;
  createdAt: number;
  status?: string;
}