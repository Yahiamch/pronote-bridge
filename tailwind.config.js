/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#000000",
          950: "#08080a",
          900: "#0c0c0f",
          850: "#121215",
          800: "#161619",
          750: "#1c1c20",
          700: "#232328",
          600: "#2c2c32",
          500: "#3a3a42",
        },
        mute: {
          DEFAULT: "#8b8b92",
          soft: "#6c6c73",
          dim: "#55555c",
        },
        accent: {
          DEFAULT: "#5ad1c8",
          water: "#39b6ff",
          flame: "#ff7a45",
          lift: "#c6ff5a",
          violet: "#9b8cff",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "26px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -22px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 40px -10px rgba(90,209,200,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 2.5s linear infinite",
        breathe: "breathe 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
