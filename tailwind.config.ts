import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        canvas: "#F7F4EB",
        sunset: "#E86A47",
        ocean: "#2A7B88",
        ink: "#2C221B",
        body: "#5A4C40",
        "surface-sand": "#E3D5C8",
        primary: {
          DEFAULT: "#E86A47", // sunset
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2A7B88", // ocean
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#8B7E74",
          foreground: "#F7F4EB",
        },
        accent: {
          DEFAULT: "#E3D5C8",
          foreground: "#2C221B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C221B",
        },
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"],
        sans: ["Satoshi", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(44, 34, 27, 0.04)",
        floating: "0 12px 40px rgba(44, 34, 27, 0.08)",
      },
      animation: {
        "reveal-up": "reveal-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards",
      },
      keyframes: {
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

