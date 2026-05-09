import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import { supabaseMisconfigured } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import ErrorBoundary from '@/components/system/ErrorBoundary';

// Route-based code splitting — each page loads only when navigated to
const HomePage = lazy(() => import('@/pages/HomePage'));
const MenuPage = lazy(() => import('@/pages/MenuPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Admin pages — separate bundle, only loads when navigating to /admin/*
const AdminLayout    = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminMenuPage  = lazy(() => import('@/pages/admin/AdminMenuPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));

// Minimal full-page skeleton shown while a route chunk is loading
const PageSkeleton = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gourmet-line border-t-gourmet-primary" />
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize Supabase session listener once at app root
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <div className="flex min-h-screen flex-col bg-gourmet-bg text-gourmet-cream">
        {/* Environment variable warning — shown when Supabase is not configured */}
        {supabaseMisconfigured && (
          <div className="sticky top-0 z-[9999] bg-yellow-500 px-4 py-2.5 text-center text-sm font-bold text-black">
            ⚠️ Supabase is not configured. Add{' '}
            <code className="rounded bg-black/15 px-1">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-black/15 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
            to your Vercel project settings, then redeploy.
          </div>
        )}
        <Header />
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public routes — use Header + CartDrawer layout */}
                <Route path="/"          element={<HomePage />} />
                <Route path="/menu"      element={<MenuPage />} />
                <Route path="/cart"      element={<CartPage />} />
                <Route path="/login"     element={<LoginPage />} />
                <Route path="/signup"    element={<SignupPage />} />
                <Route path="/order/:id" element={<OrderTrackingPage />} />
                <Route path="/profile"   element={<ProfilePage />} />

                {/* Admin routes — nested under AdminLayout (own sidebar, no Header) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index            element={<AdminDashboard />} />
                  <Route path="menu"      element={<AdminMenuPage />} />
                  <Route path="orders"    element={<AdminOrdersPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1208',
              border: '1px solid rgba(255, 248, 240, 0.12)',
              color: '#FFF8F0',
            },
          }}
        />
      </div>
      <CartDrawer />
      </Router>
      {/* Devtools only bundle in development — tree-shaken in production build */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}

export default App;
