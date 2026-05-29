"use client";

// WordReveal — splits a string into word spans and reveals them on mount
// with a blurred, lifted entrance. Sister component to a more advanced
// scroll-triggered character splitter we can add later.

import { motion, type Variants } from "framer-motion";

interface WordRevealProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const parent: Variants = {
  hidden: {},
  show: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const child: Variants = {
  hidden: { opacity: 0, y: "0.7em", filter: "blur(10px)" },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: custom, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function WordReveal({
  children,
  className = "",
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  as = "span",
}: WordRevealProps) {
  const Tag = motion[as] as typeof motion.span;
  const words = children.split(" ");

  return (
    <Tag
      className={className}
      variants={parent}
      custom={{ stagger, delay }}
      initial="hidden"
      animate="show"
      style={{ display: "inline-block" }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={child}
          custom={duration}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {w}
        </motion.span>
      ))}
    </Tag>
  );
}
