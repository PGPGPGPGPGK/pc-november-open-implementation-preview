import type { ReactNode } from "react";

/**
 * Shared shell for long-form legal pages (Terms of Service, Privacy Policy).
 * Matches the site's dark theme + design tokens. No `prose` plugin is used in
 * this app, so prose styling is applied here by hand.
 */
export function LegalLayout({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10 border-b border-[#2A3548] pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#C8F400] uppercase tracking-tight mb-3">
          {title}
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#94A3B8]">
          Last updated: {lastUpdated}
        </p>
      </header>
      {intro ? <div className="text-[#CBD5E1] leading-relaxed space-y-4 mb-10">{intro}</div> : null}
      <div className="space-y-10">{children}</div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{heading}</h2>
      <div className="text-[#CBD5E1] leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-6 space-y-2 marker:text-[#C8F400]">{children}</ul>;
}
