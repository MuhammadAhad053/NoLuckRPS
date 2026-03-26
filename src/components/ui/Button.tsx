import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-500/50',
      secondary: 'bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10',
      outline: 'border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5',
      ghost: 'text-zinc-500 hover:text-white hover:bg-white/5',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.3)] border border-green-500/50',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px] font-black uppercase tracking-widest',
      md: 'px-6 py-3 text-xs font-black uppercase tracking-widest',
      lg: 'px-8 py-4 text-sm font-black uppercase tracking-[0.2em]',
      xl: 'px-10 py-5 text-lg font-black uppercase tracking-[0.3em] italic',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative flex items-center justify-center rounded-sm font-orbitron transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
