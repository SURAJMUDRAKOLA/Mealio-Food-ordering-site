import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Home, MapPin, ShoppingCart, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/ui/Button';
import ParticleCanvas from '@/components/visual/ParticleCanvas';
import MockRazorpayModal from '@/components/payment/MockRazorpayModal';
import { formatPrice } from '@/utils/price';

const steps = [
  { id: 0, label: 'Address', icon: MapPin },
  { id: 1, label: 'Payment', icon: CreditCard },
  { id: 2, label: 'Confirm', icon: Check },
];

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  const deliveryFee = totalPrice > 799 || totalPrice === 0 ? 0 : 49;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes - promoDiscount;

  // ── Order mutation ─────────────────────────────────────────────────────────
  // Tries the Edge Function first (server-side price validation).
  // Falls back to direct Supabase insert for local dev (no function deployment needed).
  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please log in to place an order');

      const edgeFnUrl = import.meta.env.VITE_SUPABASE_URL
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-order`
        : null;

      if (edgeFnUrl) {
        // ── Path A: Edge Function (deployed, production-safe) ─────────────────
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(edgeFnUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            items: items.map((i) => ({
              id: i.id,
              quantity: i.quantity,
              name: i.name,
              image: i.image,
              isVeg: i.isVeg ?? null,
            })),
            deliveryFee,
            taxes,
          }),
        });

        if (!response.ok) {
          const err: { error?: string } = await response.json();
          throw new Error(err.error ?? 'Order validation failed');
        }

        const result: { orderId: string } = await response.json();
        return result.orderId;
      }

      // ── Path B: Direct insert (local dev / fallback) ──────────────────────
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal: totalPrice,
          delivery_fee: deliveryFee,
          taxes,
          grand_total: grandTotal,
          payment_method: 'card',
          payment_status: 'paid',
          address_snapshot: { label: 'Home', city: 'Bengaluru', line1: 'Indiranagar' },
        })
        .select('id')
        .single();

      if (orderErr || !order) throw orderErr ?? new Error('Order creation failed');

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: order.id,
          item_id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image,
          quantity: item.quantity,
          is_veg: item.isVeg ?? null,
        }))
      );
      if (itemsErr) throw itemsErr;

      return order.id as string;
    },
    onSuccess: (orderId) => {
      if (user) void qc.invalidateQueries({ queryKey: queryKeys.orders(user.id) });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${orderId}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    },
  });

  const placeOrder = () => orderMutation.mutate();

  if (totalItems === 0) {
    return (
      <div className="relative min-h-[68vh] overflow-hidden bg-gourmet-bg">
        <ParticleCanvas className="opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,107,53,.16),transparent_28rem),linear-gradient(180deg,rgba(15,10,6,.55),var(--mealio-bg))]" />
        <div className="mealio-container relative z-10 flex min-h-[68vh] items-center justify-center py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <span className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gourmet-primary/15 text-gourmet-primary">
              <ShoppingCart size={38} />
            </span>
            <h1 className="font-display text-4xl font-bold text-gourmet-cream">Your cart is empty</h1>
            <p className="mt-4 leading-7 text-gourmet-muted">Add dishes from the menu and your checkout summary will build here.</p>
            <Link to="/menu" className="mt-8 inline-flex">
              <Button size="lg"><ArrowLeft size={17} />Browse Menu</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg py-10">
      <ParticleCanvas className="opacity-55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(244,165,35,.14),transparent_28rem),linear-gradient(180deg,rgba(15,10,6,.58),rgba(15,10,6,.9)_34rem,var(--mealio-bg))]" />

      <div className="mealio-container relative z-10">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Checkout</p>
          <h1 className="mt-2 font-display text-5xl font-bold text-gourmet-cream">Your Cart</h1>
          <p className="mt-3 text-gourmet-muted">Review quantities, confirm delivery details, and place the order.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-gourmet-line bg-gourmet-surface/70 p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-gourmet-cream">Cart items ({totalItems})</h2>
              <button onClick={clearCart} className="text-sm font-bold text-gourmet-danger hover:text-red-300">Clear cart</button>
            </div>
            <AnimatePresence initial={false}>
              {items.map((item) => <CartItem key={item.id} item={item} />)}
            </AnimatePresence>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-5 shadow-card lg:sticky lg:top-28">
              <h2 className="text-xl font-extrabold text-gourmet-cream">Order Summary</h2>

              {/* Step indicator */}
              <div className="mt-5 flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = checkoutStep >= step.id;
                  return (
                    <React.Fragment key={step.id}>
                      <button onClick={() => setCheckoutStep(step.id)} className={`flex flex-col items-center gap-2 text-xs font-bold ${isActive ? 'text-gourmet-primary' : 'text-gourmet-muted'}`}>
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${isActive ? 'border-gourmet-primary bg-gourmet-primary/15' : 'border-gourmet-line bg-gourmet-bg/45'}`}>
                          <Icon size={17} />
                        </span>
                        {step.label}
                      </button>
                      {index < steps.length - 1 && <span className={`h-px flex-1 ${checkoutStep > index ? 'bg-gourmet-primary' : 'bg-gourmet-line'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Step content */}
              <div className="mt-6 rounded-lg border border-gourmet-line bg-gourmet-bg/45 p-4">
                {checkoutStep === 0 && (
                  <div className="flex gap-3">
                    <Home className="mt-1 text-gourmet-primary" size={20} />
                    <div>
                      <p className="font-bold text-gourmet-cream">Home delivery</p>
                      <p className="mt-1 text-sm leading-6 text-gourmet-muted">
                        {profile ? `Delivering to ${profile.name}` : 'Indiranagar, Bengaluru'} — address from your profile.
                      </p>
                    </div>
                  </div>
                )}
                {checkoutStep === 1 && (
                  <div className="flex gap-3">
                    <CreditCard className="mt-1 text-gourmet-primary" size={20} />
                    <div>
                      <p className="font-bold text-gourmet-cream">Mock Razorpay</p>
                      <p className="mt-1 text-sm leading-6 text-gourmet-muted">A realistic payment form will open. Use test card <span className="font-mono text-gourmet-accent">4111 1111 1111 1111</span>.</p>
                    </div>
                  </div>
                )}
                {checkoutStep === 2 && (
                  <div className="flex gap-3">
                    <Check className="mt-1 text-gourmet-primary" size={20} />
                    <div>
                      <p className="font-bold text-gourmet-cream">Ready to place order</p>
                      <p className="mt-1 text-sm leading-6 text-gourmet-muted">Order will be saved to Supabase and live tracking will begin.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-gourmet-muted">
                  <span>Subtotal</span><span className="font-semibold text-gourmet-cream">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gourmet-muted">
                  <span>Delivery Fee</span><span className="font-semibold text-gourmet-cream">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gourmet-muted">
                  <span>Taxes (5%)</span><span className="font-semibold text-gourmet-cream">{formatPrice(taxes)}</span>
                </div>
                {promoApplied && promoDiscount > 0 && (
                  <div className="flex justify-between text-gourmet-success">
                    <span className="flex items-center gap-1"><Tag size={13} />Promo ({promoCode})</span>
                    <span className="font-semibold">−{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gourmet-line pt-4 text-lg font-extrabold text-gourmet-cream">
                  <span>Total</span><span>{formatPrice(Math.max(0, grandTotal))}</span>
                </div>
              </div>

              {/* Promo code input */}
              {!promoApplied && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. WELCOME10)"
                    className="flex-1 rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!promoCode) return;
                      const { data } = await supabase
                        .from('promo_codes')
                        .select('discount_pct, max_uses, used_count, expires_at, is_active')
                        .eq('code', promoCode)
                        .single();
                      if (!data || !data.is_active) { toast.error('Invalid promo code'); return; }
                      if (data.used_count >= data.max_uses) { toast.error('Promo code limit reached'); return; }
                      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error('Promo code expired'); return; }
                      const discount = Math.round(totalPrice * (data.discount_pct / 100));
                      setPromoDiscount(discount);
                      setPromoApplied(true);
                      toast.success(`${data.discount_pct}% discount applied!`);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              )}
              {promoApplied && (
                <button
                  className="mt-2 text-xs text-gourmet-muted hover:text-gourmet-danger"
                  onClick={() => { setPromoApplied(false); setPromoDiscount(0); setPromoCode(''); }}
                >
                  Remove promo code
                </button>
              )}


              {/* CTA */}
              <div className="mt-6">
                {!user ? (
                  <Link to="/login"><Button fullWidth size="lg">Login to Checkout</Button></Link>
                ) : checkoutStep < 2 ? (
                  <Button fullWidth size="lg" onClick={() => setCheckoutStep((s) => s + 1)}>Continue</Button>
                ) : (
                  <Button fullWidth size="lg" isLoading={orderMutation.isPending} onClick={() => setShowPayment(true)}>
                    Pay {formatPrice(grandTotal)}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mock Razorpay Modal */}
      <AnimatePresence>
        {showPayment && (
          <MockRazorpayModal
            amount={grandTotal}
            onSuccess={placeOrder}
            onClose={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
