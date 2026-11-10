// Hero — above-the-fold section.
//
// Full-bleed background video pattern, mirroring ap-website's hero
// (/Users/rrs/workspace/ap-website/src/components/sections/Hero.tsx).
//
// Layer stack (back → front):
//   1. <Image> poster            — instant base layer, eliminates blank frame
//   2. <video> dual-source       — fades in on `loadeddata`, autoplay/muted/loop
//   3. ShadersHeroBackground     — subtle glow at low opacity for depth
//   4. GridPattern               — volt grid lines at low opacity
//   5. Darkening gradient        — text legibility on top of bright video frames
//   6. Content                   — eyebrow, H1, copy, CTAs, micro-stats, floating card
//
// Video served from Cloudflare R2 (pc-assets bucket). With poster + preload="auto"
// + faststart MP4 + Cloudflare CDN edge caching, autoplay is near-instant on 4G.
//
// Falls back gracefully if NEXT_PUBLIC_R2_PUBLIC_URL is unset (dev / preview
// environments without CDN access) — only the shader + grid layers render.

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { GridPattern } from "../21st/grid-pattern";
import { ShadersHeroBackground } from "../21st/shaders-hero";
import { TextReveal, TextShimmer } from "../21st/text-reveal";

const R2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
const POSTER = R2 ? `${R2}/images/hero-poster.jpg` : null;

// Two resolution pairs. Mobile (≤768px) gets the 4.5MB/6MB 720p variants
// — meaningful LCP win on cellular. Desktop gets the 15MB 1080p master.
const VIDEO_WEBM_1080 = R2 ? `${R2}/videos/hero-pickleball.webm` : null;
const VIDEO_MP4_1080 = R2 ? `${R2}/videos/hero-pickleball.mp4` : null;
const VIDEO_WEBM_720 = R2 ? `${R2}/videos/hero-pickleball-720.webm` : null;
const VIDEO_MP4_720 = R2 ? `${R2}/videos/hero-pickleball-720.mp4` : null;

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setVideoLoaded(true);
    v.addEventListener("loadeddata", onLoaded);

    // Some browsers fire 'loadeddata' before our listener attaches if the
    // file is already cached. Check readyState ≥ 2 immediately.
    if (v.readyState >= 2) setVideoLoaded(true);

    return () => v.removeEventListener("loadeddata", onLoaded);
  }, []);

  return (
    <section
      aria-label="Pickleball Central — book a court"
      className="relative h-screen min-h-[680px] max-h-[1000px] flex items-center overflow-hidden"
    >
      {/* Layer 1: poster image — instant base */}
      {POSTER && (
        <div className="absolute inset-0">
          <Image
            src={POSTER}
            alt="Pickleball Central — Hyderabad's premier pickleball court in action"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Layer 2: video — fades in on loadeddata.
          Source order matters: browsers pick the FIRST <source> whose
          media query matches AND whose type is supported. Mobile gets
          the 720p variants (3× smaller) for a real LCP improvement. */}
      {VIDEO_MP4_1080 && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER ?? undefined}
          className={`absolute inset-0 w-full h-full object-cover scale-[1.15] md:scale-[1.3] transition-opacity duration-700 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {VIDEO_WEBM_720 && (
            <source media="(max-width: 768px)" src={VIDEO_WEBM_720} type="video/webm" />
          )}
          {VIDEO_MP4_720 && (
            <source media="(max-width: 768px)" src={VIDEO_MP4_720} type="video/mp4" />
          )}
          {VIDEO_WEBM_1080 && <source src={VIDEO_WEBM_1080} type="video/webm" />}
          <source src={VIDEO_MP4_1080} type="video/mp4" />
        </video>
      )}

      {/* Layer 3: subtle shader glow at low opacity */}
      <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none">
        <ShadersHeroBackground />
      </div>

      {/* Layer 4: grid pattern at very low opacity */}
      <div
        className="absolute inset-0 text-[#C8F400]/[0.06] pointer-events-none"
        aria-hidden="true"
      >
        <GridPattern width={48} height={48} />
      </div>

      {/* Layer 5: darkening gradient (top + bottom) for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/70 via-[#0A0F1E]/30 to-[#0A0F1E]/95 pointer-events-none"
      />

      {/* Layer 6: content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
        <div className="max-w-3xl">
          {/* Big logo — sets brand presence before any copy */}
          <Image
            src="/pc-november-open-implementation-preview/logo.png"
            alt="Pickleball Central"
            width={160}
            height={160}
            priority
            className="mb-8 block w-24 h-24 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-2xl drop-shadow-[0_8px_30px_rgba(200,244,0,0.35)]"
          />

          {/* Eyebrow row */}
          <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-1.5">
            <a
              href="#dupr"
              className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-white/25 bg-[#0A0F1E]/40 backdrop-blur-md hover:border-[#C8F400]/50 transition-colors"
              aria-label="DUPR Verified Club — every tournament DUPR rated"
            >
              <Image
                src="/pc-november-open-implementation-preview/dupr-logo.png"
                alt=""
                width={64}
                height={64}
                className="h-6 w-6 rounded-md"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
                Verified Club · Rated Tournaments
              </span>
            </a>
          </div>

          {/* H1 — 21st.dev word-by-word reveal + shimmer accent */}
          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tight leading-[0.92] text-white mb-6 [text-shadow:0_2px_30px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <TextReveal text="HYDERABAD'S" delay={0.1} />
            <br />
            <TextShimmer text="HOTTEST" className="drop-shadow-[0_0_30px_rgba(200,244,0,0.35)]" />
            <br />
            <TextReveal text="PICKLEBALL COURT" delay={0.45} />
          </h1>

          {/* CTAs — October tournament registration is the primary action.
              /october is a real app route; a plain anchor keeps this a server
              rather than next/link (which would attempt app-route matching). */}
          <div className="flex flex-wrap gap-4 mb-4 mt-10">
            <a
              href="/pc-november-open-implementation-preview/events/november-2026/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C8F400] text-[#0A0F1E] text-sm font-bold uppercase tracking-[0.1em] hover:bg-[#D8FF20] transition-all shadow-[0_0_40px_-8px_rgba(200,244,0,0.6)] hover:shadow-[0_0_50px_-8px_rgba(200,244,0,0.8)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              REGISTER NOW
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Registration status line — clarifies what REGISTER NOW opens */}
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#CBD5E1] mb-12">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8F400]" aria-hidden="true" />
            Season 7 Tournament · 18 &amp; 25 Oct · registration is live
          </p>

          {/* Micro-stats bar */}
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#CBD5E1]">
            {["4 Pro Courts", "Open 6am–11pm", "4.9★ on Google", "Peerzadiguda, Hyderabad"].map(
              (label) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8F400]" aria-hidden="true" />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      {/* Bottom fade smooths transition into the next section */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0A0F1E] pointer-events-none"
      />
    </section>
  );
}
