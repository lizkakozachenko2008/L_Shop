
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface AddToCartDTO {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}
