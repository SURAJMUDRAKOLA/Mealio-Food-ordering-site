import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import ParticleCanvas from '@/components/visual/ParticleCanvas';

const navItems = [
  { to: '/admin/menu',   label: 'Menu Items', icon: ShoppingBag },
  { to: '/admin/orders', label: 'Orders',     icon: Package },
];

const AdminLayout: React.FC = () => {
  const { isAdmin } = useAdminGuard();
  const signOut = useAuthStore((s) => s.signOut);

  // Guard renders nothing while the check happens (useAdminGuard handles redirect)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gourmet-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gourmet-line border-t-gourmet-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-gourmet-bg">
      <ParticleCanvas className="opacity-20" />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-56 flex-shrink-0 flex-col border-r border-gourmet-line bg-gourmet-surface/60 backdrop-blur-sm">
        {/* Brand */}
        <div className="border-b border-gourmet-line px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">Admin</p>
          <p className="mt-1 font-display text-lg font-bold text-gourmet-cream">Mealio Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-gourmet-primary/20 text-gourmet-primary'
                  : 'text-gourmet-muted hover:bg-gourmet-cream/5 hover:text-gourmet-cream'
              }`
            }
          >
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>

          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-gourmet-primary/20 text-gourmet-primary'
                    : 'text-gourmet-muted hover:bg-gourmet-cream/5 hover:text-gourmet-cream'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-gourmet-line p-3">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gourmet-muted transition-colors hover:bg-gourmet-danger/10 hover:text-gourmet-danger"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
