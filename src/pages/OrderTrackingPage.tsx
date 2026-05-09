import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, CheckCircle, ChefHat, Clock, Home, MapPin, Package } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import type { Order, OrderItem } from '../../backend/types/database.types';
import ParticleCanvas from '@/components/visual/ParticleCanvas';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/price';

type OrderStatus = Order['status'];

const timeline: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: 'placed',           label: 'Order Placed',     icon: Package,     desc: 'We received your order' },
  { status: 'confirmed',        label: 'Confirmed',        icon: CheckCircle, desc: 'Restaurant accepted' },
  { status: 'preparing',        label: 'Preparing',        icon: ChefHat,     desc: 'Kitchen is cooking' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike,        desc: 'Rider is on the way' },
  { status: 'delivered',        label: 'Delivered',        icon: Home,        desc: 'Enjoy your meal!' },
];

const statusIndex = (s: OrderStatus) => timeline.findIndex((t) => t.status === s);

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  // Fetch order + items in parallel
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: [...queryKeys.order(id ?? ''), 'items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
      if (error) throw error;
      return (data ?? []) as OrderItem[];
    },
    enabled: !!id,
  });

  // Supabase Realtime subscription — pushes live status updates into the TanStack Query cache
  // This means the UI re-renders automatically whenever the DB row changes
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          // Merge the updated fields directly into the existing cached order
          qc.setQueryData<Order>(queryKeys.order(id), (prev) =>
            prev ? { ...prev, ...(payload.new as Partial<Order>) } : prev
          );
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [id, qc]);

  const isLoading = orderLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gourmet-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gourmet-line border-t-gourmet-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gourmet-bg text-center">
        <p className="text-xl font-bold text-gourmet-cream">Order not found</p>
        <Link to="/"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  const currentIndex = statusIndex(order.status);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg py-10">
      <ParticleCanvas className="opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_10%,rgba(16,185,129,.1),transparent_24rem)]" />

      <div className="mealio-container relative z-10 max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Live Tracking</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-gourmet-cream">Order Status</h1>
          <p className="mt-2 font-mono text-xs text-gourmet-dim">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Timeline */}
        <div className="mb-8 rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-6 shadow-card">
          <div className="space-y-0">
            {timeline.map((step, index) => {
              const Icon = step.icon;
              const done = index <= currentIndex;
              const active = index === currentIndex;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 2 }}
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        done
                          ? 'border-gourmet-success bg-gourmet-success/20 text-gourmet-success'
                          : 'border-gourmet-line bg-gourmet-bg/50 text-gourmet-dim'
                      }`}
                    >
                      <Icon size={18} />
                    </motion.div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`my-1 min-h-8 w-0.5 flex-1 transition-colors ${
                          index < currentIndex ? 'bg-gourmet-success' : 'bg-gourmet-line'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className={`text-sm font-bold ${done ? 'text-gourmet-cream' : 'text-gourmet-dim'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gourmet-muted">{step.desc}</p>
                    {active && (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-gourmet-success/15 px-2.5 py-1 text-xs font-bold text-gourmet-success">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gourmet-success" />
                        Current status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ETA */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-gourmet-line bg-gourmet-surface/60 p-4">
          <Clock size={20} className="text-gourmet-accent" />
          <div>
            <p className="text-sm font-bold text-gourmet-cream">Estimated delivery</p>
            <p className="text-xs text-gourmet-muted">
              {order.status === 'delivered'
                ? 'Delivered!'
                : order.status === 'out_for_delivery'
                ? '5–10 minutes'
                : '25–35 minutes'}
            </p>
          </div>
          <div className="ml-auto">
            <MapPin size={20} className="text-gourmet-primary" />
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-5">
          <h2 className="mb-4 text-lg font-bold text-gourmet-cream">Items in this order</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gourmet-cream">{item.name}</p>
                  <p className="text-xs text-gourmet-muted">× {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gourmet-accent">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-gourmet-line pt-4 text-sm">
            <div className="flex justify-between text-gourmet-muted">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gourmet-muted">
              <span>Delivery</span>
              <span>{order.delivery_fee === 0 ? 'Free' : formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-gourmet-muted">
              <span>Taxes</span><span>{formatPrice(order.taxes)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-gourmet-line pt-3 text-base font-extrabold text-gourmet-cream">
              <span>Total paid</span><span>{formatPrice(order.grand_total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/menu" className="flex-1"><Button fullWidth variant="outline">Order again</Button></Link>
          <Link to="/profile" className="flex-1"><Button fullWidth>My orders</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
