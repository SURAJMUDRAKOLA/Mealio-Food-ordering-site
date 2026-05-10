import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import { Flame, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCart } from '../../store/useCartStore';
import { useUiStore } from '../../store/useUiStore';
import Button from '../ui/Button';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Cart', path: '/cart' },
  { name: 'Profile', path: '/profile' },
];

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const displayUser = user && profile ? { id: user.id, name: profile.name } : null;
  const { totalItems } = useCart();
  const openCart = useUiStore((state) => state.openCart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const badgeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0 && badgeRef.current) {
      anime({
        targets: badgeRef.current,
        scale: [0.5, 1.25, 1],
        duration: 520,
        easing: 'easeOutElastic(1, .7)',
      });
    }
  }, [totalItems]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-gourmet-primary/20 bg-gourmet-bg/80 shadow-card backdrop-blur-xl'
          : 'border-transparent bg-gourmet-bg/45 backdrop-blur-md'
      }`}
    >
      <div className="mealio-container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gourmet-primary text-white shadow-glow">
            <Flame size={24} />
          </span>
          <span>
            <span className="block font-display text-2xl font-bold leading-none text-gourmet-cream">Mealio</span>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gourmet-accent">dark gourmet</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-gourmet-line bg-gourmet-surface/65 p-1 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? 'text-gourmet-bg' : 'text-gourmet-muted hover:text-gourmet-cream'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-gourmet-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={openCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gourmet-line bg-gourmet-surface/70 text-gourmet-cream transition-colors hover:border-gourmet-primary/50 hover:text-gourmet-primary"
            aria-label="Open cart drawer"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span
                ref={badgeRef}
                className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gourmet-primary px-1.5 text-xs font-extrabold text-white"
              >
                {totalItems}
              </span>
            )}
          </button>

          {displayUser ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-md border border-gourmet-line bg-gourmet-surface/70 px-3 py-2 text-sm font-semibold text-gourmet-cream">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gourmet-primary/20 text-gourmet-accent">
                  <User size={16} />
                </span>
                {displayUser.name.split(' ')[0]}
              </button>
              <div className="invisible absolute right-0 mt-3 w-52 translate-y-2 rounded-lg border border-gourmet-line bg-gourmet-surface p-2 opacity-0 shadow-card transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link to="/profile" className="block rounded-md px-3 py-2 text-sm text-gourmet-muted hover:bg-gourmet-cream/10 hover:text-gourmet-cream">
                  My Profile
                </Link>
                <Link to="/cart" className="block rounded-md px-3 py-2 text-sm text-gourmet-muted hover:bg-gourmet-cream/10 hover:text-gourmet-cream">
                  Order history
                </Link>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gourmet-muted hover:bg-gourmet-cream/10 hover:text-gourmet-cream"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={openCart}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gourmet-line bg-gourmet-surface/70 text-gourmet-cream"
            aria-label="Open cart drawer"
          >
            <ShoppingCart size={19} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gourmet-primary px-1 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gourmet-line bg-gourmet-surface/70 text-gourmet-cream"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gourmet-line bg-gourmet-bg/95 md:hidden"
          >
            <div className="mealio-container flex flex-col gap-2 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-md px-3 py-3 text-base font-semibold ${
                    location.pathname === link.path ? 'bg-gourmet-primary text-white' : 'text-gourmet-muted'
                  }`}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
              {displayUser ? (
                <button
                  onClick={() => { signOut(); closeMenu(); }}
                  className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-base font-semibold text-gourmet-muted"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={closeMenu}>
                  <Button fullWidth>Login</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
