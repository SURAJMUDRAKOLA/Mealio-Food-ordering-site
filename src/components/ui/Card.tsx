import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = true
}) => {
  const hoverAnimation = hover ? {
    whileHover: { y: -5, transition: { duration: 0.2 } },
    whileTap: { y: 0 }
  } : {};
  
  return (
    <motion.div
      className={`overflow-hidden rounded-lg border border-gourmet-line bg-gourmet-card/90 shadow-card backdrop-blur ${className}`}
      {...hoverAnimation}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
