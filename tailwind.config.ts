import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

const scrollbarHidePlugin = plugin(({ addUtilities }) => {
  addUtilities({
    '.scrollbar-hide': {
      /* IE and Edge */
      '-ms-overflow-style': 'none',
      /* Firefox */
      'scrollbar-width': 'none',
      /* Safari and Chrome */
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }
  });
});

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)"],
      },
      colors: {
        brand: {
          green: "#047857",
          "green-light": "#059669",
          "green-dark": "#065f46",
          "green-muted": "rgba(4, 120, 87, 0.15)",
        },
      },
    },
  },
  plugins: [scrollbarHidePlugin],
};

export default config;
