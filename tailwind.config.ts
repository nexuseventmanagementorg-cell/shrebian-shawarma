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
        shrebian: {
          bg: "#08090C",
          surface: "#12141A",
          card: "#181B24",
          elevated: "#212532",
          border: "#2C3244",
          red: {
            DEFAULT: "#E50914",
            hover: "#DC2626",
            dark: "#991B1B",
            light: "#F87171",
            glow: "rgba(229, 9, 20, 0.4)"
          },
          gold: {
            DEFAULT: "#F59E0B",
            hover: "#D97706",
            light: "#FBBF24",
            glow: "rgba(245, 158, 11, 0.35)"
          },
          flame: "#FF5722",
          cream: "#FFF7ED",
          text: "#F8FAFC",
          muted: "#94A3B8"
        }
      },
      boxShadow: {
        glowRed: "0 0 25px -4px rgba(229, 9, 20, 0.5)",
        glowGold: "0 0 25px -4px rgba(245, 158, 11, 0.4)",
        card: "0 8px 30px rgba(0, 0, 0, 0.6)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
