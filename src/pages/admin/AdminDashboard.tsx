import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { formatPrice } from '@/utils/price';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalMenuItems: number;
  activeMenuItems: number;
}

const statCards = [
  { key: 'totalOrders',      label: 'Total Orders',        icon: Package,     color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  { key: 'totalRevenue',     label: 'Total Revenue',       icon: TrendingUp,  color: 'text-gourmet-accent', bg: 'bg-gourmet-accent/10' },
  { key: 'totalMenuItems',   label: 'Menu Items',          icon: ShoppingBag, color: 'text-gourmet-primary', bg: 'bg-gourmet-primary/10' },
  { key: 'activeMenuItems',  label: 'Available Items',     icon: Users,       color: 'text-green-400',  bg: 'bg-green-500/10' },
] as const;

const AdminDashboard: React.FC = () => {
  useAdminGuard();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [{ data: orders }, { data: items }] = await Promise.all([
        supabase.from('orders').select('grand_total'),
        supabase.from('menu_items').select('is_available'),
      ]);

      return {
        totalOrders: orders?.length ?? 0,
        totalRevenue: orders?.reduce((sum, o) => sum + Number(o.grand_total), 0) ?? 0,
        totalMenuItems: items?.length ?? 0,
        activeMenuItems: items?.filter((i) => i.is_available).length ?? 0,
      };
    },
    staleTime: 60 * 1000,
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-gourmet-cream">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-gourmet-line bg-gourmet-surface/70 p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gourmet-muted">{label}</p>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${bg} ${color}`}>
                <Icon size={17} />
              </span>
            </div>
            {isLoading ? (
              <div className="mt-3 h-7 w-24 animate-pulse rounded bg-gourmet-line" />
            ) : (
              <p className="mt-3 text-2xl font-extrabold text-gourmet-cream">
                {key === 'totalRevenue'
                  ? formatPrice(stats?.[key] ?? 0)
                  : (stats?.[key] ?? 0).toLocaleString()}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/menu"
          className="group flex items-center gap-4 rounded-lg border border-gourmet-line bg-gourmet-surface/60 p-5 transition-colors hover:border-gourmet-primary/40 hover:bg-gourmet-primary/5"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gourmet-primary/15 text-gourmet-primary">
            <ShoppingBag size={20} />
          </span>
          <div>
            <p className="font-bold text-gourmet-cream group-hover:text-gourmet-primary">Manage Menu</p>
            <p className="text-sm text-gourmet-muted">Edit items, toggle availability, add new dishes</p>
          </div>
        </Link>
        <Link
          to="/admin/orders"
          className="group flex items-center gap-4 rounded-lg border border-gourmet-line bg-gourmet-surface/60 p-5 transition-colors hover:border-gourmet-primary/40 hover:bg-gourmet-primary/5"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gourmet-primary/15 text-gourmet-primary">
            <Package size={20} />
          </span>
          <div>
            <p className="font-bold text-gourmet-cream group-hover:text-gourmet-primary">Manage Orders</p>
            <p className="text-sm text-gourmet-muted">Update statuses, track live orders</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
