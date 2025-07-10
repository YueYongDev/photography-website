"use client";

import { motion } from "motion/react";

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const TRANSITION_SECTION = {
  duration: 0.3,
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransitionContainer({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionItem({ children, className }: PageTransitionProps) {
  return (
    <motion.div variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className={className}>
      {children}
    </motion.div>
  );
}
