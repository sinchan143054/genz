import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={clsx('glass-card rounded-[32px] border border-white/10 p-6 shadow-glow', className)}
    >
      {children}
    </motion.div>
  );
}
