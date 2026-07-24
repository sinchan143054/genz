import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20',
        className,
      )}
      {...props}
    />
  );
}
