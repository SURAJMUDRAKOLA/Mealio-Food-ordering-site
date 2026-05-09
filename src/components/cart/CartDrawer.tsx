import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import { formatPrice } from '@/utils/price';
import Button from '@/components/ui/Button';
import CartItem from '@/components/cart/CartItem';

const CartDrawer: React.FC = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuthStore();
  const isCartOpen = useUiStore((state) => state.isCartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const deliveryFee = totalPrice > 799 || totalPrice === 0 ? 0 : 49;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={closeCart}
            aria-label="Close cart drawer"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gourmet-line bg-gourmet-surface shadow-card"
          >
            <div className="flex items-center justify-between border-b border-gourmet-line p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">Cart drawer</p>
                <h2 className="mt-1 text-2xl font-bold text-gourmet-cream">{totalItems} item{totalItems === 1 ? '' : 's'}</h2>
              </div>
              <button
                onClick={closeCart}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gourmet-line text-gourmet-muted hover:bg-gourmet-cream/10 hover:text-gourmet-cream"
                aria-label="Close cart drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gourmet-muted">Selected dishes</span>
                    <button onClick={clearCart} className="text-sm font-semibold text-gourmet-danger hover:text-red-300">
                      Clear all
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gourmet-primary/15 text-gourmet-primary">
                    <ShoppingBag size={30} />
                  </span>
                  <h3 className="text-xl font-bold text-gourmet-cream">Your cart is empty</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-gourmet-muted">
                    Add a dish from the menu and it will appear here instantly.
                  </p>
                  <Link to="/menu" onClick={closeCart} className="mt-6">
                    <Button>Browse Menu</Button>
                  </Link>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gourmet-line bg-gourmet-bg/55 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gourmet-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gourmet-cream">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gourmet-muted">
                    <span>Delivery</span>
                    <span className="font-semibold text-gourmet-cream">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gourmet-muted">
                    <span>Taxes</span>
                    <span className="font-semibold text-gourmet-cream">{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gourmet-line pt-4 text-lg font-extrabold text-gourmet-cream">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="mt-5">
                  {user ? (
                    <Button fullWidth size="lg">
                      Proceed to Checkout
                    </Button>
                  ) : (
                    <Link to="/login" onClick={closeCart}>
                      <Button fullWidth size="lg">
                        Login to Checkout
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
