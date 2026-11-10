// Shaders Hero Background — a lightweight pure-CSS replacement for the
// 21st.dev "Shaders Hero Section" by Vaibhav Kumar Singh.
//
// The original uses a WebGL fragment shader which is gorgeous but adds
// a few hundred KB and a GPU hit that tanks Lighthouse on low-end Androids.
// For the same perceived effect we layer animated radial gradients + conic
// gradient rotation. Volt-on-navy palette, zero JS runtime cost.
//
// Use this as the outermost layer of the hero section — everything else
// (photo, copy, grid pattern) sits on top.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// Safari on iOS crashes ("A problem repeatedly occurred") when an
// infinite transform animation composites over many blur(24px+) layers —
// that's exactly what this component + the hero stack becomes. On
// mobile we render everything static; desktop keeps the slow rotate.
function useIsNarrow(threshold = 768) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${threshold}px)`);
    setNarrow(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [threshold]);
  return narrow;
}

export function ShadersHeroBackground({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const isNarrow = useIsNarrow();
  const animateRotate = !reducedMotion && !isNarrow;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Base navy wash */}
      <div className="absolute inset-0 bg-[#0A0F1E]" />

      {/* Slow-rotating conic gradient for subtle motion */}
      <motion.div
        className="absolute -inset-[100%] opacity-30"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(200,244,0,0.15), rgba(10,15,30,0) 30%, rgba(29,78,216,0.1) 60%, rgba(10,15,30,0) 80%, rgba(200,244,0,0.15))",
        }}
        // exactOptionalPropertyTypes forbids `animate: undefined`; only
        // pass the prop when we actually want motion.
        {...(animateRotate
          ? {
              animate: { rotate: 360 },
              transition: { duration: 60, repeat: Infinity, ease: "linear" },
            }
          : {})}
      />

      {/* Large blurred volt glow, top-left */}
      <div
        className="absolute -top-1/3 -left-1/4 h-[120%] w-[120%] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(200,244,0,0.25) 0%, rgba(200,244,0,0) 45%)",
        }}
      />

      {/* Smaller volt glow bottom-right for depth */}
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(200,244,0,0.2) 0%, rgba(200,244,0,0) 50%)",
        }}
      />

      {/* Deep blue/teal accent for color variety */}
      <div
        className="absolute top-1/4 right-1/3 h-[60%] w-[60%] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(13,115,119,0.35) 0%, rgba(13,115,119,0) 60%)",
        }}
      />

      {/* Final darkening overlay so text stays legible on top of the shader */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1E]/30 to-[#0A0F1E]" />
    </div>
  );
}
