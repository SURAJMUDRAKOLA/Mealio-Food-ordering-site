import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, LogOut, MapPin, Package, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import type { Order } from '../../backend/types/database.types';
import ParticleCanvas from '@/components/visual/ParticleCanvas';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/price';

const statusColors: Record<string, string> = {
  placed:           'bg-blue-500/20 text-blue-300',
  confirmed:        'bg-yellow-500/20 text-yellow-300',
  preparing:        'bg-orange-500/20 text-orange-300',
  out_for_delivery: 'bg-purple-500/20 text-purple-300',
  delivered:        'bg-green-500/20 text-green-300',
  cancelled:        'bg-red-500/20 text-red-300',
};

const ProfilePage: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editName, setEditName] = useState(profile?.name ?? '');
  const [editPhone, setEditPhone] = useState(profile?.phone ?? '');
  const [editing, setEditing] = useState(false);

  // Fetch order history — only runs when user is authenticated
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: queryKeys.orders(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
    enabled: !!user,
  });

  // Profile update mutation — invalidates profile cache on success
  const updateMutation = useMutation({
    mutationFn: async (updates: { name: string; phone: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate so the auth store re-reads fresh profile data
      void qc.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? '') });
      setEditing(false);
    },
  });

  // 🔒 Not logged in — show a beautiful login prompt instead of crashing
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gourmet-bg px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gourmet-line bg-gourmet-surface shadow-card">
          <User size={36} className="text-gourmet-muted" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-gourmet-cream">You're not signed in</h1>
          <p className="mt-2 text-gourmet-muted">Please log in or create an account to view your profile.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button variant="outline" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  // Profile loading (user is authenticated but profile not yet fetched)
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gourmet-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gourmet-line border-t-gourmet-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg py-10">
      <ParticleCanvas className="opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,53,.12),transparent_24rem)]" />

      <div className="mealio-container relative z-10 max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Account</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-gourmet-cream">My Profile</h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-6 shadow-card"
        >
          <div className="flex items-start gap-5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gourmet-primary/20 text-gourmet-primary">
                <User size={30} />
              </span>
            )}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gourmet-muted">Full Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm text-gourmet-cream outline-none focus:border-gourmet-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gourmet-muted">Phone</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm text-gourmet-cream outline-none focus:border-gourmet-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      isLoading={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ name: editName, phone: editPhone || null })}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold text-gourmet-cream">{profile.name}</p>
                  <p className="mt-1 text-sm text-gourmet-muted">{profile.email}</p>
                  {profile.phone && <p className="mt-0.5 text-sm text-gourmet-muted">{profile.phone}</p>}
                  <button
                    onClick={() => {
                      setEditName(profile.name ?? '');
                      setEditPhone(profile.phone ?? '');
                      setEditing(true);
                    }}
                    className="mt-3 text-xs font-semibold text-gourmet-primary hover:text-gourmet-accent"
                  >
                    Edit profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-gourmet-line pt-5">
            <MapPin size={16} className="text-gourmet-primary" />
            <p className="text-sm text-gourmet-muted">
              Indiranagar, Bengaluru —{' '}
              <span className="font-semibold text-gourmet-cream">add full address →</span>
            </p>
          </div>
        </motion.div>

        {/* Orders */}
        <div className="mb-6 rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gourmet-cream">
            <Package size={20} className="text-gourmet-primary" />
            Order History
          </h2>

          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gourmet-line border-t-gourmet-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gourmet-muted">No orders yet.</p>
              <Link to="/menu" className="mt-4 inline-block">
                <Button size="sm">Browse Menu</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/order/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-gourmet-line bg-gourmet-bg/50 p-4 transition-colors hover:border-gourmet-primary/40 hover:bg-gourmet-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[order.status] ?? 'bg-gourmet-line text-gourmet-muted'}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gourmet-cream">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gourmet-muted">
                        <Clock size={11} />
                        {new Date(order.placed_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gourmet-accent">{formatPrice(order.grand_total)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            signOut();
            navigate('/');
          }}
          className="flex items-center gap-2 text-sm font-semibold text-gourmet-muted transition-colors hover:text-gourmet-danger"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
