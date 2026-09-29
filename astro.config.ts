import { defineConfig, fontProviders } from "astro/config";

// Боевой адрес задаётся переменной SITE_URL. Пока её нет, сайт считается черновиком
// (Vercel или локальная сборка) и закрыт от индексации — см. src/lib/indexing.ts.
const vercelHost = process.env["VERCEL_PROJECT_PRODUCTION_URL"];
const previewUrl = vercelHost ? `https://${vercelHost}` : "http://localhost:4321";

export default defineConfig({
  site: process.env["SITE_URL"] ?? previewUrl,
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Cormorant Garamond",
      cssVariable: "--font-display",
      weights: [600],
      styles: ["normal"],
      subsets: ["cyrillic", "latin"],
      fallbacks: ["Georgia", "serif"],
    },
  ],
});
