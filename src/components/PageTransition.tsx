import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
