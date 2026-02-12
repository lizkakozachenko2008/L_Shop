const API_URL = "http://localhost:5000/api";

const fetchOptions = {
  credentials: "include" as const,
  headers: {
    "Content-Type": "application/json",
  },
};

export const api = {
  auth: {
    register: (data: { name: string; email: string; phone?: string; password: string }) =>
      fetch(`${API_URL}/auth/register`, { method: "POST", body: JSON.stringify(data), ...fetchOptions }),
    login: (data: { email: string; password: string }) =>
      fetch(`${API_URL}/auth/login`, { method: "POST", body: JSON.stringify(data), ...fetchOptions }),
    me: () => fetch(`${API_URL}/auth/me`, { ...fetchOptions }),
    logout: () => fetch(`${API_URL}/auth/logout`, { method: "POST", ...fetchOptions }),
  },
  products: {
    get: (params?: URLSearchParams | Record<string, string>) => {
      const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
      return fetch(`${API_URL}/products?${searchParams}`, { ...fetchOptions });
    },
  },
  cart: {
    get: () => fetch(`${API_URL}/cart`, { ...fetchOptions }),
    add: (data: { productId: string; quantity?: number }) =>
      fetch(`${API_URL}/cart/add`, { method: "POST", body: JSON.stringify(data), ...fetchOptions }),
    update: (productId: string, quantity: number) =>
      fetch(`${API_URL}/cart/update/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }), ...fetchOptions }),
    remove: (productId: string) =>
      fetch(`${API_URL}/cart/remove/${productId}`, { method: "DELETE", ...fetchOptions }),
  },
  orders: {
    // ✅ ДОБАВЛЯЕМ selectedItems В ТИП И ЗАПРОС
    create: (data: { 
      deliveryAddress: string; 
      deliveryPhone: string; 
      deliveryEmail: string; 
      paymentMethod: string;
      selectedItems?: string[]; // ✅ МАССИВ ID ВЫБРАННЫХ ТОВАРОВ
    }) => 
      fetch(`${API_URL}/orders/create`, { 
        method: "POST", 
        body: JSON.stringify(data), // ✅ selectedItems автоматом попадет в body
        ...fetchOptions 
      }),
    get: () => fetch(`${API_URL}/orders`, { ...fetchOptions }),
  },
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // ✅ УЛУЧШАЕМ ОБРАБОТКУ ОШИБОК - парсим сообщение с сервера
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка API");
    } catch {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
  }
  return response.json();
};