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
          obsidian: "#050507",
          black: "#0B0B0E",
          graphite: "#111118",
          red: "#D0192A",
          "red-deep": "#7A0712",
          blue: "#1E6FFF",
          cobalt: "#102A7A",
          teal: "#22F0D0",
          cyan: "#00C2FF",
          electric: "#31F7FF",
          magenta: "#FF2BD6",
          violet: "#8A3FFC",
          lavender: "#C084FC",
          ember: "#F4B64A",
          "ember-deep": "#C57A1D",
          carbon: "#07070B",
          "carbon-2": "#101018",
          chrome: "#D8E2EE",
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
        "ah-glow-magenta":
          "0 0 0 1px rgba(255,43,214,.28), 0 18px 60px rgba(255,43,214,.14)",
        "ah-glow-cyan":
          "0 0 0 1px rgba(49,247,255,.28), 0 18px 60px rgba(49,247,255,.13)",
      },
      letterSpacing: {
        "ah-tight": "0em",
      },
    },
  },
  plugins: [],
} satisfies Config;
