/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#000000",
          950: "#080808",
          900: "#0d0d0d",
          850: "#111111",
          800: "#161616",
          750: "#1c1c1e",
          700: "#232325",
          600: "#2c2c2e",
          500: "#3a3a3c",
          400: "#48484a",
        },
        mute: {
          DEFAULT: "#8e8e93",
          soft: "#636366",
          dim: "#48484a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 24px -4px rgba(0,0,0,0.8)",
        lift: "0 8px 32px -8px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%,100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 2.5s linear infinite",
        breathe: "breathe 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
