import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { useCart } from '@/store/useCartStore';
import { formatPrice } from '@/utils/price';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="mb-3 rounded-lg border border-gourmet-line bg-gourmet-card/70 p-3"
    >
      <div className="flex gap-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-1 text-sm font-bold text-gourmet-cream">{item.name}</h3>
              <p className="mt-1 text-xs text-gourmet-muted">{formatPrice(item.price)}</p>
            </div>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gourmet-muted hover:bg-gourmet-danger/15 hover:text-gourmet-danger"
              onClick={() => removeFromCart(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center rounded-md border border-gourmet-line bg-gourmet-bg/45">
              <button
                className="inline-flex h-8 w-8 items-center justify-center text-gourmet-muted hover:text-gourmet-primary"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-gourmet-cream">{item.quantity}</span>
              <button
                className="inline-flex h-8 w-8 items-center justify-center text-gourmet-muted hover:text-gourmet-primary"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="text-sm font-extrabold text-gourmet-accent">{formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
