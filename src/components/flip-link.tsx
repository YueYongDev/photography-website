"use client";

import { motion } from "framer-motion";

const DURATION = 0.25;
const STAGGER = 0.025;

interface Props {
  children: string;
  href: string;
}

/**
 * FlipLink component displays a flip link.
 *
 * @param {string} children - The children of the FlipLink component.
 * @param {string} href - The href of the FlipLink component.
 * @returns {JSX.Element} - The FlipLink component.
 */
const FlipLink = ({ children, href }: Props) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      className="relative block overflow-hidden whitespace-nowrap uppercase text-sm font-light"
      style={{
        lineHeight: 0.75,
      }}
    >
      <div>
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-100%",
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: "100%",
              },
              hovered: {
                y: 0,
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
};

export default FlipLink;
