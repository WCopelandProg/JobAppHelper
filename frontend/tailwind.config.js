/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#e0eaff",
          200: "#c7d8ff",
          300: "#a3bdff",
          400: "#7a99ff",
          500: "#5470f7",
          600: "#3c4fe8",
          700: "#303dcc",
          800: "#2a34a4",
          900: "#283183",
          950: "#1a1d4d",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
