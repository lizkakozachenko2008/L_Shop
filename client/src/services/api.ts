const API_URL = "http://localhost:5000/api";

const fetchOptions = {
  credentials: "include" as const, // для куки сессии
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
    get: (params?: Record<string, string>) => {
      const searchParams = new URLSearchParams(params);
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
    create: (data: { deliveryAddress: string; deliveryPhone: string; deliveryEmail: string; paymentMethod: string }) =>
      fetch(`${API_URL}/orders`, { method: "POST", body: JSON.stringify(data), ...fetchOptions }),
    get: () => fetch(`${API_URL}/orders`, { ...fetchOptions }),
  },
};

// Helper для обработки ответа
export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error("Ошибка API");
  return response.json();
};