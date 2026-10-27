import React from 'react';
import { motion } from 'framer-motion';

/**
  * Signature easing — a soft "clay settle" (cubic-bezier(0.22, 1, 0.36, 1)).
  * Shared across the entire platform so all motion feels in one rhythm.
  */
export const EASE = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
  * Reveal: Fade + rise a block into view once when scrolled into view.
  * Viewport margin is set to -60px so it triggers smoothly before reaching center.
  */
export function Reveal({
  children,
  className = '',
  delay = 0,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
  * Stagger: Stagger children elements into view as a sequenced group.
  * Direct children should be wrapped in <StaggerItem>.
  */
export function Stagger({
  children,
  className = '',
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

/**
  * StaggerItem: Individual item within a <Stagger> parent.
  */
export function StaggerItem({
  children,
  className = '',
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
