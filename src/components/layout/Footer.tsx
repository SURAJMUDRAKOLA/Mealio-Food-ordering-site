import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gourmet-line bg-gourmet-surface/75">
      <div className="mealio-container py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gourmet-primary text-white shadow-glow">
                <Flame size={24} />
              </span>
              <span className="font-display text-2xl font-bold text-gourmet-cream">Mealio</span>
            </Link>
            <p className="max-w-md text-sm leading-7 text-gourmet-muted">
              Premium meals, curated kitchens, and a faster ordering experience built around the food you actually crave.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gourmet-line text-gourmet-muted transition-colors hover:border-gourmet-primary/50 hover:text-gourmet-primary"
                  aria-label="Mealio social link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gourmet-accent">Explore</h3>
            <ul className="space-y-3 text-sm text-gourmet-muted">
              <li>
                <Link to="/" className="hover:text-gourmet-cream">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gourmet-cream">Menu</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gourmet-cream">Cart</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gourmet-cream">Member login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gourmet-accent">Service</h3>
            <ul className="space-y-4 text-sm text-gourmet-muted">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-gourmet-primary" />
                Bengaluru, Mumbai, Delhi NCR
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="flex-shrink-0 text-gourmet-primary" />
                +91 98765 43210
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="flex-shrink-0 text-gourmet-primary" />
                concierge@mealio.app
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gourmet-line pt-6 text-sm text-gourmet-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Mealio. Built for premium food delivery.</p>
          <p>Free delivery above Rs. 799.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
