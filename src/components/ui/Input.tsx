import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', type, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
            type={resolvedType}
            className={`
              rounded-md border border-gourmet-line bg-gourmet-bg/60 px-4 py-3 text-gourmet-cream shadow-sm
              placeholder:text-gourmet-muted/60 focus:border-gourmet-primary focus:outline-none focus:ring-2 focus:ring-gourmet-primary/35
              ${isPassword ? 'pr-11' : ''}
              ${widthClass} ${error ? 'border-gourmet-danger' : ''} ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-3 flex items-center text-gourmet-muted transition-colors hover:text-gourmet-cream"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
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
