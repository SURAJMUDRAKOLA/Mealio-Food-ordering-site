import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { act } from '@testing-library/react';
import CartItem from '@/components/cart/CartItem';
import { useCartStore } from '@/store/useCartStore';
import type { CartItem as CartItemType } from '@/types';

// Mock framer-motion — jsdom can't run animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

const biryani: CartItemType = {
  id: 'bir-001',
  name: 'Chicken Biryani',
  description: 'Aromatic basmati rice with spiced chicken',
  price: 349,
  image: 'https://example.com/biryani.jpg',
  category: 'Biryani',
  isVeg: false,
  quantity: 2,
};

beforeEach(() => {
  act(() => {
    useCartStore.setState({
      items: [{ ...biryani }],
    });
  });
});

describe('CartItem — rendering', () => {
  it('renders the item name', () => {
    render(<CartItem item={biryani} />);
    expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
  });

  it('renders the current quantity', () => {
    render(<CartItem item={biryani} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the line price (price × quantity)', () => {
    render(<CartItem item={biryani} />);
    // 349 × 2 = 698
    expect(screen.getByText(/698/)).toBeInTheDocument();
  });

  it('renders the decrease button', () => {
    render(<CartItem item={biryani} />);
    expect(screen.getByRole('button', { name: /decrease chicken biryani/i })).toBeInTheDocument();
  });

  it('renders the increase button', () => {
    render(<CartItem item={biryani} />);
    expect(screen.getByRole('button', { name: /increase chicken biryani/i })).toBeInTheDocument();
  });

  it('renders the remove button', () => {
    render(<CartItem item={biryani} />);
    expect(screen.getByRole('button', { name: /remove chicken biryani/i })).toBeInTheDocument();
  });
});

describe('CartItem — interactions', () => {
  it('calls updateQuantity with quantity + 1 when increase is clicked', () => {
    render(<CartItem item={biryani} />);
    fireEvent.click(screen.getByRole('button', { name: /increase chicken biryani/i }));

    const item = useCartStore.getState().items.find((i) => i.id === 'bir-001');
    expect(item?.quantity).toBe(3);
  });

  it('calls updateQuantity with quantity - 1 when decrease is clicked', () => {
    render(<CartItem item={biryani} />);
    fireEvent.click(screen.getByRole('button', { name: /decrease chicken biryani/i }));

    const item = useCartStore.getState().items.find((i) => i.id === 'bir-001');
    expect(item?.quantity).toBe(1);
  });

  it('removes item from cart when quantity reaches 0', () => {
    // Start with quantity = 1
    act(() => {
      useCartStore.setState({ items: [{ ...biryani, quantity: 1 }] });
    });
    render(<CartItem item={{ ...biryani, quantity: 1 }} />);
    fireEvent.click(screen.getByRole('button', { name: /decrease chicken biryani/i }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item from cart when remove button is clicked', () => {
    render(<CartItem item={biryani} />);
    fireEvent.click(screen.getByRole('button', { name: /remove chicken biryani/i }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
