import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        terminal: {
          green: "#39FF14",
          cyan: "#00DDEB",
          purple: "#8B5CF6",
          pink: "#FF10F0",
          orange: "#FF8C00",
          red: "#FF073A",
        },
        matrix: {
          dark: "#0A0A0A",
          darker: "#000000",
        },
        neon: {
          blue: "#00FFFF",
          green: "#39FF14",
          pink: "#FF10F0",
          purple: "#8B5CF6",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        mono: ["Fira Code", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "matrix-rain": "matrix-rain 20s linear infinite",
        "glitch": "glitch 0.3s ease-in-out",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite alternate",
        "scan-line": "scan-line 2s linear infinite",
      },
      keyframes: {
        "matrix-rain": {
          "0%": { transform: "translateY(-100vh)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "pulse-neon": {
          "0%": { 
            boxShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "100%": { 
            boxShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100vh)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
