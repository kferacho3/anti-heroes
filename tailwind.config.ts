import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ah: {
          black: "#0B0B0E",
          red: "#D0192A",
          blue: "#1E6FFF",
          white: "#F5F5F5",
          gray: "#1A1A1F",
          soft: "#A0A0A0",
        },
      },
      boxShadow: {
        "ah-glow-red":
          "0 0 0 1px rgba(208,25,42,.35), 0 18px 60px rgba(208,25,42,.15)",
        "ah-glow-blue":
          "0 0 0 1px rgba(30,111,255,.35), 0 18px 60px rgba(30,111,255,.15)",
      },
      letterSpacing: {
        "ah-tight": "-0.05em",
      },
    },
  },
  plugins: [],
} satisfies Config;
