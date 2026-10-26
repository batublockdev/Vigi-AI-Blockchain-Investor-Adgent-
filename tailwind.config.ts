import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        celo: {
          green: "#35D07F",
          gold: "#FBCC5C",
          dark: "#0F172A",
          card: "#1E293B",
          border: "#334155",
        },
      },
    },
  },
  plugins: [],
};
export default config;
