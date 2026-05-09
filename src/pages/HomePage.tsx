import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import { ArrowRight, Bike, Clock, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { categories, menuItems } from '../data/menu';
import FoodCard from '../components/food/FoodCard';
import Button from '../components/ui/Button';
import ParticleCanvas from '../components/visual/ParticleCanvas';

interface AnimatedCounterProps {
  value: number;
  suffix: string;
  label: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, suffix, label }) => {
  const numberRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const state = { value: 0 };
    anime({
      targets: state,
      value,
      round: 1,
      duration: 1400,
      easing: 'easeOutExpo',
      update: () => {
        if (numberRef.current) {
          numberRef.current.textContent = `${state.value}${suffix}`;
        }
      },
    });
  }, [suffix, value]);

  return (
    <div className="rounded-lg border border-gourmet-line bg-gourmet-surface/70 p-4">
      <span className="block text-2xl font-extrabold text-gourmet-cream" ref={numberRef}>
        0{suffix}
      </span>
      <div className="mt-1 text-sm text-gourmet-muted">{label}</div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const popularItems = menuItems.filter((item) => item.popular).slice(0, 4);

  useEffect(() => {
    if (!headlineRef.current) return;

    anime({
      targets: headlineRef.current.querySelectorAll('.hero-word'),
      translateY: [28, 0],
      opacity: [0, 1],
      delay: anime.stagger(95),
      duration: 850,
      easing: 'easeOutExpo',
    });
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden border-b border-gourmet-line">
        <ParticleCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,107,53,.25),transparent_24rem)]" />
        <div className="mealio-container relative z-10 grid min-h-[calc(100vh-5rem)] items-center gap-10 py-16 lg:grid-cols-[1.04fr_.96fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-gourmet-line bg-gourmet-surface/65 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent"
            >
              <Sparkles size={16} />
              Curated in 20 minutes
            </motion.p>
            <h1 ref={headlineRef} className="max-w-3xl font-display text-5xl font-extrabold leading-[0.95] text-gourmet-cream md:text-7xl">
              {['Cravings', 'Delivered.'].map((word) => (
                <span key={word} className="hero-word mr-4 inline-block opacity-0">
                  {word}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gourmet-muted">
              Discover premium kitchens, live cart updates, and rich food cards built for fast ordering without losing the restaurant-menu feel.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-lg border border-gourmet-line bg-gourmet-surface/75 p-3 shadow-card backdrop-blur sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-md bg-gourmet-bg/55 px-4 py-3 text-gourmet-muted">
                <MapPin size={20} className="text-gourmet-primary" />
                <input
                  className="w-full bg-transparent text-sm text-gourmet-cream outline-none placeholder:text-gourmet-muted/70"
                  placeholder="Enter delivery location"
                />
              </label>
              <Link to="/menu">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search size={18} />
                  Find food
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              <AnimatedCounter value={500} suffix="+" label="Restaurant partners" />
              <AnimatedCounter value={20} suffix=" min" label="Average delivery" />
              <AnimatedCounter value={50} suffix="k+" label="Happy customers" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-10 rounded-full bg-gourmet-primary/20 blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=980&q=85"
              alt="Premium bowl meal"
              className="relative aspect-square w-full rounded-full object-cover gourmet-ring"
            />
            <div className="absolute bottom-10 left-0 rounded-lg border border-gourmet-line bg-gourmet-bg/80 p-4 shadow-card backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gourmet-primary/20 text-gourmet-primary">
                  <Bike size={23} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gourmet-cream">Rider assigned</p>
                  <p className="text-xs text-gourmet-muted">ETA updates in real time</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-gourmet-bg py-10">
        <div className="mealio-container">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Cuisine lanes</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-gourmet-cream">Pick a mood</h2>
            </div>
            <Link to="/menu" className="hidden items-center gap-2 text-sm font-bold text-gourmet-primary hover:text-gourmet-accent sm:flex">
              Full menu <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/menu"
                className="group relative h-36 min-w-48 snap-start overflow-hidden rounded-lg border border-gourmet-line bg-gourmet-card"
              >
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gourmet-bg via-gourmet-bg/30 to-transparent" />
                <span className="absolute bottom-4 left-4 text-lg font-extrabold text-gourmet-cream">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mealio-container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Trending now</p>
              <h2 className="mt-2 font-display text-4xl font-bold text-gourmet-cream">Chef-picked favorites</h2>
            </div>
            <Link to="/menu">
              <Button variant="outline">
                View all dishes
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {popularItems.map((item) => (
              <motion.div key={item.id} variants={{ hidden: { y: 18, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                <FoodCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-gourmet-line bg-gourmet-surface/45 py-14">
        <div className="mealio-container grid gap-5 md:grid-cols-3">
          {[
            { icon: Clock, title: 'Timed for freshness', copy: 'Menu cards show prep windows so customers know what arrives fastest.' },
            { icon: ShieldCheck, title: 'Quality-first kitchens', copy: 'Ratings, tags, and veg markers make decisions quick and trustworthy.' },
            { icon: Bike, title: 'Checkout-ready cart', copy: 'A slide-over cart keeps the ordering context visible without leaving the menu.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-lg border border-gourmet-line bg-gourmet-bg/45 p-6">
              <feature.icon className="mb-5 text-gourmet-primary" size={28} />
              <h3 className="text-lg font-extrabold text-gourmet-cream">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gourmet-muted">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
