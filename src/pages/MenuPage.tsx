import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { menuItems as staticMenuItems, categories } from '@/data/menu';
import type { MenuItem } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import FoodCard from '@/components/food/FoodCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ParticleCanvas from '@/components/visual/ParticleCanvas';
import { formatPrice } from '@/utils/price';

type DietFilter = 'all' | 'veg' | 'non-veg';
type SortMode = 'popular' | 'rating' | 'price-low' | 'price-high';

// Stable sort comparators — defined outside component so they never cause re-renders
const sortComparators: Record<SortMode, (a: MenuItem, b: MenuItem) => number> = {
  popular:    (a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)),
  rating:     (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  'price-low':  (a, b) => a.price - b.price,
  'price-high': (a, b) => b.price - a.price,
};

// Maps a Supabase DB row → the MenuItem shape used throughout the frontend
function dbRowToMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    price: row.price as number,
    image: row.image_url as string,
    // category_id uses slug format (e.g. 'north-indian') → display name ('North Indian')
    category:
      (row.category_id as string)
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) ?? '',
    popular: (row.is_popular as boolean) ?? false,
    rating: (row.rating as number) ?? undefined,
    prepTime: (row.prep_time as string) ?? undefined,
    isVeg: (row.is_veg as boolean) ?? true,
    tag: (row.tag as string) ?? undefined,
  };
}


const MenuPage: React.FC = () => {
  // Always use static menu data from menu.ts — this is the single source of truth.
  // Supabase DB may have stale/fewer items, so we skip the DB query for menu display.
  const menuItems = staticMenuItems;

  // Derived from query data — updates automatically when DB data loads
  const { lowestPrice, highestPrice } = useMemo(
    () => ({
      lowestPrice: Math.min(...menuItems.map((i) => i.price)),
      highestPrice: Math.max(...menuItems.map((i) => i.price)),
    }),
    [menuItems]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rawSearch, setRawSearch] = useState('');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  // Debounce search — list re-filters only after user pauses typing (300ms)
  const searchQuery = useDebounce(rawSearch, 300);


  // Memoize category name lookup — only recomputes when selectedCategory changes
  const selectedCategoryName = useMemo(
    () => (selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : undefined),
    [selectedCategory]
  );

  // Single-pass O(n) filter + sort — all conditions checked in one loop
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems
      .filter((item) => {
        // Short-circuit: bail out as soon as any condition fails (no wasted checks)
        if (selectedCategoryName && item.category !== selectedCategoryName) return false;
        if (dietFilter === 'veg' && !item.isVeg) return false;
        if (dietFilter === 'non-veg' && item.isVeg) return false;
        if (item.price > maxPrice) return false;
        if (query) {
          const haystack = `${item.name} ${item.description} ${item.category} ${item.tag ?? ''}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort(sortComparators[sortMode]);
  }, [menuItems, selectedCategoryName, dietFilter, maxPrice, searchQuery, sortMode]);

  const hasActiveFilters =
    selectedCategory || rawSearch || dietFilter !== 'all' || maxPrice !== highestPrice;
  const searchTerm = searchQuery.trim().toLowerCase();
  const categorySuggestions = useMemo(
    () =>
      searchTerm
        ? categories.filter((c) => c.name.toLowerCase().includes(searchTerm)).slice(0, 4)
        : categories.slice(0, 4),
    [searchTerm]
  );
  const dishSuggestions = useMemo(
    () =>
      menuItems
        .filter((item) =>
          searchTerm
            ? `${item.name} ${item.category} ${item.tag ?? ''}`.toLowerCase().includes(searchTerm)
            : item.popular
        )
        .slice(0, 6),
    [searchTerm, menuItems]
  );
  const showSearchSuggestions = isSearchFocused && (categorySuggestions.length > 0 || dishSuggestions.length > 0);

  const resetFilters = () => {
    setSelectedCategory('');
    setRawSearch('');
    setDietFilter('all');
    setMaxPrice(highestPrice);
    setSortMode('popular');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg py-10">
      <div className="pointer-events-none fixed inset-0 z-0 h-screen overflow-hidden">
        <ParticleCanvas className="opacity-55" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,107,53,.14),transparent_28rem),linear-gradient(180deg,rgba(15,10,6,.58),rgba(15,10,6,.9)_34rem,var(--mealio-bg))]" />

      <div className="mealio-container relative z-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">Indian-first catalog</p>
            <h1 className="mt-2 font-display text-5xl font-bold text-gourmet-cream">Menu</h1>
            <p className="mt-3 max-w-2xl text-gourmet-muted">
              Browse North Indian, South Indian, biryani, meals, street food, coastal, Chinese, Italian, rolls, desserts, and beverages with practical market pricing.
            </p>
          </div>
          <div className="rounded-lg border border-gourmet-line bg-gourmet-surface/70 px-4 py-3 text-sm text-gourmet-muted">
            <span className="font-extrabold text-gourmet-cream">{filteredItems.length}</span> dishes available
          </div>
        </div>

        <div className="relative z-30 mb-8 rounded-lg border border-gourmet-line bg-gourmet-surface/90 p-4 shadow-card backdrop-blur-xl">
          <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_240px_auto_230px] xl:items-end">
            <div className="relative z-40">
              <Input
                type="text"
                placeholder="Search biryani, dosa, thali, kebab, noodles..."
                value={rawSearch}
                onChange={(event) => setRawSearch(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 140)}
                fullWidth
                className="pl-11"
                aria-label="Search menu"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gourmet-muted" size={18} />
              <AnimatePresence>
                {showSearchSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 right-0 top-[calc(100%+.5rem)] overflow-hidden rounded-lg border border-gourmet-line bg-gourmet-bg shadow-card"
                  >
                    {categorySuggestions.length > 0 && (
                      <div className="border-b border-gourmet-line p-2">
                        <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gourmet-accent">Categories</p>
                        {categorySuggestions.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setRawSearch('');
                              setIsSearchFocused(false);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold text-gourmet-muted hover:bg-gourmet-cream/10 hover:text-gourmet-cream"
                          >
                            {category.name}
                            <span className="text-xs text-gourmet-muted/70">Category</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {dishSuggestions.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gourmet-accent">Dishes</p>
                        {dishSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSearchQuery(item.name);
                              setSelectedCategory('');
                              setIsSearchFocused(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gourmet-cream/10"
                          >
                            <img src={item.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-gourmet-cream">{item.name}</span>
                              <span className="block truncate text-xs text-gourmet-muted">{item.category} - {formatPrice(item.price)}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <label className="relative flex flex-col gap-2 text-sm font-semibold text-gourmet-muted">
              Cuisine
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-12 appearance-none rounded-md border border-gourmet-line bg-gourmet-bg px-4 pr-10 text-sm font-bold text-gourmet-cream outline-none transition-colors hover:border-gourmet-primary/50 focus:border-gourmet-primary"
                aria-label="Choose cuisine category"
              >
                <option value="">All cuisines</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-gourmet-muted" size={18} />
            </label>

            <div className="flex flex-wrap gap-2">
              {(['all', 'veg', 'non-veg'] as DietFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDietFilter(filter)}
                  className={`rounded-md border px-4 py-3 text-sm font-bold capitalize transition-colors ${
                    dietFilter === filter
                      ? 'border-gourmet-primary bg-gourmet-primary text-white'
                      : 'border-gourmet-line text-gourmet-muted hover:text-gourmet-cream'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <label className="flex min-w-56 flex-col gap-2 text-sm font-semibold text-gourmet-muted">
              Up to {formatPrice(maxPrice)}
              <input
                type="range"
                min={lowestPrice}
                max={highestPrice}
                step={10}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="accent-gourmet-primary"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gourmet-line pt-4 md:flex-row md:items-center md:justify-between">
            <div className="min-h-9 text-sm text-gourmet-muted">
              {selectedCategoryName ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gourmet-primary/40 bg-gourmet-primary/10 px-3 py-2 font-bold text-gourmet-cream">
                  {selectedCategoryName}
                  <button onClick={() => setSelectedCategory('')} className="text-gourmet-muted hover:text-gourmet-cream" aria-label="Clear cuisine">
                    <X size={14} />
                  </button>
                </span>
              ) : (
                <span>Use search suggestions or the cuisine dropdown to narrow the catalog.</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={17} className="text-gourmet-muted" />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="rounded-md border border-gourmet-line bg-gourmet-bg px-3 py-2 text-sm font-semibold text-gourmet-cream outline-none"
                aria-label="Sort menu"
              >
                <option value="popular">Popular first</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X size={15} />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="[contain-intrinsic-size:440px] [content-visibility:auto]">
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gourmet-line bg-gourmet-surface/70 py-16 text-center"
          >
            <p className="text-xl font-bold text-gourmet-cream">No dishes match those filters.</p>
            <p className="mt-2 text-gourmet-muted">Try a wider price range or another cuisine.</p>
            <div className="mt-6">
              <Button onClick={resetFilters}>Reset filters</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
