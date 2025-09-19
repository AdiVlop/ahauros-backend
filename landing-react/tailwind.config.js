import { defineConfig } from '@tailwindcss/vite'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        aeonik: ["Aeonik", "sans-serif"],
      },
      colors: {
        brand: {
          gold: "#e0bd40",
          goldAlt: "#d8b63d",
          dark: "#000000",
          light: "#ffffff",
        },
      },
    },
  },
})