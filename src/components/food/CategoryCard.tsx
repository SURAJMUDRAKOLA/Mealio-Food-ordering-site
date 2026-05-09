import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onClick: (id: string) => void;
  isActive: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, isActive }) => {
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -4 }}
      whileTap={{ y: 0 }}
      onClick={() => onClick(category.id)}
      className={`relative h-28 overflow-hidden rounded-lg border text-left transition-colors ${
        isActive ? 'border-gourmet-primary shadow-glow' : 'border-gourmet-line hover:border-gourmet-primary/50'
      }`}
    >
      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-gourmet-bg via-gourmet-bg/35 to-transparent" />
      <span className="absolute bottom-3 left-3 text-sm font-extrabold text-gourmet-cream">{category.name}</span>
      {isActive && <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-gourmet-primary" />}
    </motion.button>
  );
};

export default CategoryCard;
