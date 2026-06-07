import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme
        "cozy-pink": "#F8C8DC",
        "cozy-rose": "#E8A7C0",
        "cozy-cream": "#FFF8F3",
        "cozy-lavender": "#E8DFF5",
        // Dark theme
        "cozy-dark-rose": "#3A2632",
        "cozy-muted-lavender": "#4A4255",
        "cozy-dark-bg": "#1F1F24",
        "cozy-accent-pink": "#DFA0C0",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
