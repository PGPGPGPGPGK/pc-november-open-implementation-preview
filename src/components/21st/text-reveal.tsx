"use client";

// 21st.dev-style word-by-word reveal.
// Each word slides up + un-blurs with an expo-out stagger.
// Renders a <span> wrapper so it can sit inside any heading element.

import { motion, type Variants } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
};

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const word: Variants = {
  hidden: { y: "110%", opacity: 0, filter: "blur(12px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export function TextReveal({ text, className, wordClassName, delay = 0, stagger = 0.07 }: Props) {
  const words = text.split(/(\s+)/);
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="show"
      variants={container(stagger, delay)}
      aria-label={text}
    >
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i} aria-hidden>
            {w}
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
            <motion.span variants={word} className={`inline-block ${wordClassName ?? ""}`}>
              {w}
            </motion.span>
          </span>
        ),
      )}
    </motion.span>
  );
}

// Gradient-sweep shimmer for a single inline word/phrase.
// Uses background-clip:text + animated background-position.
type ShimmerProps = {
  text: string;
  className?: string;
  /** Override the gradient; defaults to volt → white → volt */
  gradient?: string;
  /** Loop duration in seconds */
  duration?: number;
};

export function TextShimmer({
  text,
  className,
  gradient = "linear-gradient(90deg, #C8F400 0%, #FFFFFF 45%, #C8F400 55%, #C8F400 100%)",
  duration = 3.2,
}: ShimmerProps) {
  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className ?? ""}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: "250% 100%",
      }}
      initial={{ backgroundPosition: "200% 0%" }}
      animate={{ backgroundPosition: "-100% 0%" }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {text}
    </motion.span>
  );
}
