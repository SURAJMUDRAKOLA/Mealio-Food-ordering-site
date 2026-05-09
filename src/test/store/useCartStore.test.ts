import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCartStore } from '@/store/useCartStore';
import type { MenuItem } from '@/types';

// Sample menu item used across all cart tests
const pizza: MenuItem = {
  id: 'ita-001',
  name: 'Margherita Pizza',
  description: 'Classic pizza with mozzarella and basil',
  price: 329,
  image: 'https://example.com/pizza.jpg',
  category: 'Italian',
  isVeg: true,
  popular: true,
};

const burger: MenuItem = {
  id: 'burg-001',
  name: 'Veg Burger',
  description: 'Crispy veg patty burger',
  price: 199,
  image: 'https://example.com/burger.jpg',
  category: 'Fast Food',
  isVeg: true,
};

// Reset store to empty state before each test
beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] });
  });
});

describe('useCartStore — addToCart', () => {
  it('adds a new item with quantity 1', () => {
    act(() => useCartStore.getState().addToCart(pizza));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('ita-001');
    expect(items[0].quantity).toBe(1);
  });

  it('increments quantity when the same item is added again', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(pizza);
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('adds multiple different items independently', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(burger);
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });
});

describe('useCartStore — removeFromCart', () => {
  it('removes the correct item by id', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(burger);
      useCartStore.getState().removeFromCart('ita-001');
    });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('burg-001');
  });

  it('does nothing when removing an id that does not exist', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().removeFromCart('nonexistent');
    });

    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe('useCartStore — updateQuantity', () => {
  it('updates an item quantity', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().updateQuantity('ita-001', 5);
    });

    const item = useCartStore.getState().items.find((i) => i.id === 'ita-001');
    expect(item?.quantity).toBe(5);
  });

  it('removes item when quantity is set to 0', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().updateQuantity('ita-001', 0);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item when quantity is set below 0', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().updateQuantity('ita-001', -1);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('useCartStore — clearCart', () => {
  it('empties all items', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(burger);
      useCartStore.getState().clearCart();
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('useCartStore — derived totals', () => {
  it('calculates total items (sum of quantities)', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(pizza);
      useCartStore.getState().addToCart(burger);
    });

    const { items } = useCartStore.getState();
    const totalItems = items.reduce((t, i) => t + i.quantity, 0);
    expect(totalItems).toBe(3); // 2 pizzas + 1 burger
  });

  it('calculates total price correctly', () => {
    act(() => {
      useCartStore.getState().addToCart(pizza);  // 329
      useCartStore.getState().addToCart(pizza);  // 329 × 2 = 658
      useCartStore.getState().addToCart(burger); // 199 × 1 = 199
    });

    const { items } = useCartStore.getState();
    const totalPrice = items.reduce((t, i) => t + i.price * i.quantity, 0);
    expect(totalPrice).toBe(329 * 2 + 199);
  });
});
