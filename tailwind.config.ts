import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E8791C",
          "orange-dark": "#C7630F",
          navy: "#1F3A56",
          bg: "#F5F7FA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
