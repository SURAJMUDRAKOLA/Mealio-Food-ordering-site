import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="mb-2 block text-sm font-medium text-gourmet-cream"
          >
            {label}
          </label>
        )}
        <motion.div
          initial={{ y: 0 }}
          whileFocus={{ y: -2 }}
          className="relative"
        >
          <input
            ref={ref}
            className={`
              rounded-md border border-gourmet-line bg-gourmet-bg/60 px-4 py-3 text-gourmet-cream shadow-sm 
              placeholder:text-gourmet-muted/60 focus:border-gourmet-primary focus:outline-none focus:ring-2 focus:ring-gourmet-primary/35
              ${widthClass} ${error ? 'border-gourmet-danger' : ''} ${className}
            `}
            {...props}
          />
        </motion.div>
        {error && (
          <p className="mt-2 text-sm text-gourmet-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
