import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Loader2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { formatPrice } from '@/utils/price';
import type { Order } from '../../../backend/types/database.types';

type OrderStatus = Order['status'];

const ALL_STATUSES: OrderStatus[] = [
  'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled',
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed:           'bg-blue-500/20 text-blue-300 border-blue-500/30',
  confirmed:        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  preparing:        'bg-orange-500/20 text-orange-300 border-orange-500/30',
  out_for_delivery: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  delivered:        'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled:        'bg-red-500/20 text-red-300 border-red-500/30',
};

interface OrderWithProfile extends Order {
  profiles?: { name: string; email: string } | null;
}

const AdminOrdersPage: React.FC = () => {
  useAdminGuard();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  // Fetch all orders with the user's profile info joined
  const { data: orders = [], isLoading } = useQuery<OrderWithProfile[]>({
    queryKey: ['admin', 'orders', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, profiles(name, email)')
        .order('placed_at', { ascending: false })
        .limit(200);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as OrderWithProfile[];
    },
    staleTime: 15 * 1000, // orders update frequently — short stale time
  });

  // Update order status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(`Order status → ${status.replace('_', ' ')}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  // Filter by search (order id prefix or customer name)
  const filtered = orders.filter((order) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      order.id.toLowerCase().startsWith(q) ||
      order.profiles?.name?.toLowerCase().includes(q) ||
      order.profiles?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">Management</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-gourmet-cream">Orders</h1>
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gourmet-muted" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full rounded-lg border border-gourmet-line bg-gourmet-surface/60 py-2.5 pl-9 pr-4 text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === 'all'
                ? 'bg-gourmet-primary text-white'
                : 'border border-gourmet-line text-gourmet-muted hover:text-gourmet-cream'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                filterStatus === s
                  ? 'bg-gourmet-primary text-white'
                  : 'border border-gourmet-line text-gourmet-muted hover:text-gourmet-cream'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-lg border border-gourmet-line bg-gourmet-surface/60">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gourmet-primary" size={28} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gourmet-line text-left">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Order</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Customer</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Total</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Placed</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gourmet-muted"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-gourmet-line/50 transition-colors hover:bg-gourmet-cream/3"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gourmet-cream">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gourmet-cream">{order.profiles?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-gourmet-dim">{order.profiles?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gourmet-accent">
                    {formatPrice(order.grand_total)}
                  </td>
                  <td className="px-4 py-3 text-gourmet-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(order.placed_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Inline status dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })
                      }
                      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold outline-none ${STATUS_COLORS[order.status]}`}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-gourmet-surface text-gourmet-cream">
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/order/${order.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-md p-1.5 text-gourmet-muted transition-colors hover:text-gourmet-primary"
                      title="View order tracking page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="py-12 text-center text-gourmet-muted">No orders found</p>
        )}
      </div>

      <p className="mt-3 text-right text-xs text-gourmet-dim">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
};

export default AdminOrdersPage;
