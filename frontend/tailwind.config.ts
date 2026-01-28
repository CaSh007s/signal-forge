import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  // Fix 1: Use string "class" instead of array ["class"]
  darkMode: "class",

  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 1. Mapped Colors (Your Design System)
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "surface-elevated": "hsl(var(--surface-elevated))",
        border: "hsl(var(--border))",
        input: "hsl(var(--border))",
        ring: "hsl(var(--accent) / 0.4)",

        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",

        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover: "hsl(var(--accent-hover))",
        },

        // ShadCN compat mapping
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--text-primary))",
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "#09090b",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-elevated))",
          foreground: "hsl(var(--text-primary))",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-elevated))",
          foreground: "hsl(var(--text-muted))",
        },
        card: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--text-primary))",
        },
      },
      // 2. Mapped Fonts
      fontFamily: {
        sans: ["var(--font-ui)", "sans-serif"],
        brand: ["var(--font-brand)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        report: ["var(--font-report)", "sans-serif"],
      },
      // 3. Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // Fix 2: Use imported plugins instead of require()
  plugins: [tailwindAnimate, typography],
};

export default config;
