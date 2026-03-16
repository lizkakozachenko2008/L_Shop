export interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}