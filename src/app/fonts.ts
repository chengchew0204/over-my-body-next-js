// src/app/fonts.ts
// Load EVO2 via next/font/local; expose a CSS variable.
import localFont from "next/font/local";

/**
 * Weight mapping assumption:
 * - Regular  -> 400
 * - Massive  -> 700
 * - Extreme  -> 900
 * Oblique files map to italic style of the same weight.
 * Adjust if the vendor specifies different numeric weights.
 */
export const evo2 = localFont({
  src: [
    // Regular (normal & italic)
    { path: "../../public/asset/fonts/EVO2/EVO2-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-Regular.otf",   weight: "400", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-RegularOblique.woff2", weight: "400", style: "italic" },
    { path: "../../public/asset/fonts/EVO2/EVO2-RegularOblique.otf",   weight: "400", style: "italic" },

    // Massive (bold & bold-italic)
    { path: "../../public/asset/fonts/EVO2/EVO2-Massive.woff2", weight: "700", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-Massive.otf",   weight: "700", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-MassiveOblique.woff2", weight: "700", style: "italic" },
    { path: "../../public/asset/fonts/EVO2/EVO2-MassiveOblique.otf",   weight: "700", style: "italic" },

    // Extreme (black & black-italic)
    { path: "../../public/asset/fonts/EVO2/EVO2-Extreme.woff2", weight: "900", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-Extreme.otf",   weight: "900", style: "normal" },
    { path: "../../public/asset/fonts/EVO2/EVO2-ExtremeOblique.woff2", weight: "900", style: "italic" },
    { path: "../../public/asset/fonts/EVO2/EVO2-ExtremeOblique.otf",   weight: "900", style: "italic" },
  ],
  variable: "--font-evo2",
  display: "swap",
  preload: true,
  // We manage CJK fallbacks in CSS; do not auto-insert generic fallbacks.
  adjustFontFallback: false,
});
