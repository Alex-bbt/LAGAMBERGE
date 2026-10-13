// @ts-check
import { defineConfig } from 'astro/config';

// Polices hébergées localement (src/styles/polices.css) : l'@import Google Fonts
// du design system est retiré du CSS généré, sans modifier lagamberge-design-system/.
const sansGoogleFonts = {
  postcssPlugin: 'lg-sans-google-fonts',
  AtRule: {
    /** @param {import('postcss').AtRule} regle */
    import(regle) {
      if (/fonts\.googleapis\.com/.test(regle.params)) regle.remove();
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.lagamberge.com',
  vite: { css: { postcss: { plugins: [sansGoogleFonts] } } },
});
