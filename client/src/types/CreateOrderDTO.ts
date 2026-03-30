export interface CreateOrderDTO {
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryEmail: string;
  paymentMethod: string;
  /** Массив ID выбранных товаров (опционально). Если не передан — сервер берёт все товары из корзины */
  selectedItems?: string[];
}
