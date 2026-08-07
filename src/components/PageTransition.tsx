"use client";

import { motion } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for a premium, non-linear feel
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
