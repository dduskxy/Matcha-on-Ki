import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
