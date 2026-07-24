import { forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-400/50',
          variant === 'primary' && 'bg-violet-500 text-white hover:bg-violet-400',
          variant === 'secondary' && 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
          variant === 'ghost' && 'bg-transparent text-slate-200 hover:bg-white/10',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
