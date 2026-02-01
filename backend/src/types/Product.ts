export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number; // опционально
  rating?: number;
  stock: number; // наличие
  brand: string;
  category: string; // например "Уход за лицом", "Макияж" и т.д.
  thumbnail?: string; // URL картинки 
  images?: string[]; // массив картинок
}