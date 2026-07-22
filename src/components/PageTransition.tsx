import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.96, y: 15 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04, y: -15 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
