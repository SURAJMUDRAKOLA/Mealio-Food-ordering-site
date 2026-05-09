export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  rating?: number;
  prepTime?: string;
  isVeg?: boolean;
  tag?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
