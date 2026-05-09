import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Star } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import type { MenuItem } from '@/types';
import { useCart } from '@/store/useCartStore';
import { useUiStore } from '@/store/useUiStore';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/utils/price';

interface FoodCardProps {
  item: MenuItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const openCart = useUiStore((state) => state.openCart);
  const [imageFailed, setImageFailed] = useState(false);

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(item);
    anime({
      targets: event.currentTarget,
      scale: [1, 1.18, 1],
      rotate: [0, -8, 0],
      duration: 460,
      easing: 'easeOutBack',
    });
    openCart();
  };

  return (
    <Card className="group flex h-full flex-col" hover={false}>
      <div className="relative h-52 overflow-hidden">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_20%,rgba(255,107,53,.35),transparent_18rem),linear-gradient(135deg,#2a1a0c,#0f0a06)] p-6 text-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gourmet-accent">{item.category}</p>
              <p className="mt-2 font-display text-2xl font-bold text-gourmet-cream">{item.name}</p>
            </div>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gourmet-bg via-gourmet-bg/20 to-transparent" />
        {item.popular && (
          <span className="absolute left-3 top-3 rounded-full bg-gourmet-primary px-3 py-1 text-xs font-bold text-white shadow-glow">
            Trending
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full border border-gourmet-line bg-gourmet-bg/75 px-3 py-1 text-xs font-semibold text-gourmet-cream backdrop-blur">
          {item.tag ?? item.category}
        </span>
      </div>

      <div className="flex flex-grow flex-col p-4">
        <h3 className="text-lg font-bold text-gourmet-cream">{item.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-gourmet-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-gourmet-cream/10 px-2.5 py-1">
            <Star size={13} className="fill-gourmet-accent text-gourmet-accent" />
            {(item.rating ?? 4.5).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gourmet-cream/10 px-2.5 py-1">
            <Clock size={13} />
            {item.prepTime ?? '20 min'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gourmet-cream/10 px-2.5 py-1">
            <span className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-gourmet-success' : 'bg-gourmet-danger'}`} />
            {item.isVeg ? 'Veg' : 'Non-veg'}
          </span>
        </div>

        <p className="mb-4 mt-3 flex-grow text-sm leading-6 text-gourmet-muted">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="rounded-full bg-gourmet-accent/15 px-3 py-1.5 text-base font-extrabold text-gourmet-accent">
            {formatPrice(item.price)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gourmet-primary text-white shadow-glow transition-colors hover:bg-[#ff7c4d]"
            onClick={handleAddToCart}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>
    </Card>
  );
};

export default FoodCard;
