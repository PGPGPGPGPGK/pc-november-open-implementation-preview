// Tailwind v4 PostCSS plugin. Required for `@import "tailwindcss"` and
// `@theme { ... }` blocks to resolve at build time.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
