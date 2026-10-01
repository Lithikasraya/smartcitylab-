import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        brand: {
          blue:    "#2563EB",
          black:   "#0A0A0A",
          white:   "#FFFFFF",
          alt:     "#F8F9FA",
          gray:    "#6B7280",
          border:  "#E5E7EB",
          success: "#10B981",
          error:   "#EF4444",
        },
        // Extended gray-950 (Tailwind v3 doesn't include it natively)
        gray: {
          950: "#0a0a0f",
        },
      },
      borderRadius: {
        btn:  "10px",
        card: "16px",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'blue-glow': '0 0 24px rgba(37,99,235,0.25)',
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
