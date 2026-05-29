"use client";

// ChapterLabel — Hubtown-style mono uppercase tag above every section
// headline. Brackets give it the bracketed-chapter feel. 12px, +0.2em
// tracking, muted color, ~32px above the headline.

import { motion } from "framer-motion";
import { Scramble } from "@/components/motion/Scramble";

interface ChapterLabelProps {
  num: string;
  word: string;
  className?: string;
}

export function ChapterLabel({ num, word, className = "" }: ChapterLabelProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`mono text-[12px] tracking-[0.2em] text-(--color-muted) mb-8 inline-flex items-center gap-3 ${className}`}
    >
      <Scramble text={num} duration={500} stagger={20} className="text-(--color-muted-2)" />
      <Scramble text={`[ ${word} ]`} duration={620} stagger={22} />
    </motion.p>
  );
}
