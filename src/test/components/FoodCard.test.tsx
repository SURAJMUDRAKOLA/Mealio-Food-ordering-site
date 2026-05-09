import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { act } from '@testing-library/react';
import FoodCard from '@/components/food/FoodCard';
import { useCartStore } from '@/store/useCartStore';
import type { MenuItem } from '@/types';

// Mock anime.js — it uses DOM APIs not available in jsdom
vi.mock('animejs/lib/anime.es.js', () => ({
  default: vi.fn(),
}));

// Mock framer-motion to render plain divs — prevents jsdom animation errors
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
      React.createElement('button', { onClick, ...props }, children),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock useUiStore to capture openCart calls
vi.mock('@/store/useUiStore', () => ({
  useUiStore: (selector: (s: { openCart: () => void }) => unknown) =>
    selector({ openCart: vi.fn() }),
}));

const pizza: MenuItem = {
  id: 'ita-001',
  name: 'Margherita Pizza',
  description: 'Classic mozzarella and basil pizza',
  price: 329,
  image: 'https://example.com/pizza.jpg',
  category: 'Italian',
  isVeg: true,
  popular: true,
  rating: 4.7,
  prepTime: '25 min',
};

beforeEach(() => {
  act(() => { useCartStore.setState({ items: [] }); });
});

describe('FoodCard — rendering', () => {
  it('renders the item name', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    render(<FoodCard item={pizza} />);
    // Price element should contain ₹ and 329
    const priceEl = screen.getByText(/329/);
    expect(priceEl).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText(/mozzarella and basil/i)).toBeInTheDocument();
  });

  it('shows "Trending" badge for popular items', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('does NOT show "Trending" badge for non-popular items', () => {
    render(<FoodCard item={{ ...pizza, popular: false }} />);
    expect(screen.queryByText('Trending')).not.toBeInTheDocument();
  });

  it('shows "Veg" indicator for vegetarian items', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText('Veg')).toBeInTheDocument();
  });

  it('shows "Non-veg" indicator for non-vegetarian items', () => {
    render(<FoodCard item={{ ...pizza, isVeg: false }} />);
    expect(screen.getByText('Non-veg')).toBeInTheDocument();
  });

  it('renders the add-to-cart button with correct aria-label', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByRole('button', { name: /add margherita pizza to cart/i })).toBeInTheDocument();
  });

  it('shows prepTime when provided', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText('25 min')).toBeInTheDocument();
  });

  it('falls back to "20 min" when prepTime is undefined', () => {
    render(<FoodCard item={{ ...pizza, prepTime: undefined }} />);
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  it('shows rating when provided', () => {
    render(<FoodCard item={pizza} />);
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });
});

describe('FoodCard — add to cart', () => {
  it('adds the item to cart when the button is clicked', () => {
    render(<FoodCard item={pizza} />);

    const btn = screen.getByRole('button', { name: /add margherita pizza to cart/i });
    fireEvent.click(btn);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('ita-001');
  });

  it('increments quantity on repeated clicks', () => {
    render(<FoodCard item={pizza} />);
    const btn = screen.getByRole('button', { name: /add margherita pizza to cart/i });

    fireEvent.click(btn);
    fireEvent.click(btn);

    const { items } = useCartStore.getState();
    expect(items[0].quantity).toBe(2);
  });
});
