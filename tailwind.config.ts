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
        accent: {
          DEFAULT: "#2540EB",
          light: "#4D6BFF",
          dark: "#1A2FA8",
        },
        ink: {
          DEFAULT: "#0C1424",
          light: "#2A3550",
          muted: "#6B7280",
        },
        bone: {
          DEFAULT: "#F5F5F4",
          light: "#FAFAF9",
          dark: "#E7E5E4",
        },
        celo: {
          green: "#35D07F",
          gold: "#FBCC5C",
          dark: "#0F172A",
          card: "#1E293B",
          border: "#334155",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
