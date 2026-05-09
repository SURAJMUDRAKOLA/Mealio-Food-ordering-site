import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return { items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeFromCart: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter((i) => i.id !== id) };
          return { items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) };
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'mealio-cart' }
  )
);

export const selectTotalItems = (state: CartState) =>
  state.items.reduce((t, i) => t + i.quantity, 0);

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((t, i) => t + i.price * i.quantity, 0);

// Backward-compat shim keeps useCart() working in all existing components
export const useCart = () => {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const totalItems = items.reduce((t, i) => t + i.quantity, 0);
  const totalPrice = items.reduce((t, i) => t + i.price * i.quantity, 0);
  return { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice };
};
