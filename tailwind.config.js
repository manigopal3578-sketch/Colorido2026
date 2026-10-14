/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#FBFBFD",
          soft: "#F5F5FA",
          dark: "#090814",
          card: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#5227FF",
          hover: "#431cd6",
          light: "#EAE6FF",
        },
        cultural: {
          DEFAULT: "#FF2E93",
          hover: "#E01C7B",
          light: "#FFEBF4",
          glow: "rgba(255, 46, 147, 0.25)",
        },
        sports: {
          DEFAULT: "#FF5E3A",
          hover: "#E84925",
          light: "#FFF0EB",
          glow: "rgba(255, 94, 58, 0.25)",
        },
        cyanAccent: {
          DEFAULT: "#00DCEB",
          light: "#E0FBFC",
        },
        gold: {
          DEFAULT: "#FFC857",
          light: "#FFF8E7",
        },
        foreground: {
          DEFAULT: "#090814",
          muted: "#525266",
          subtle: "#717188",
        },
        border: {
          DEFAULT: "#E9E9F0",
          light: "#F0F0F5",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "Unbounded", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
