/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4e7",
          100: "#f8e3bd",
          400: "#d4a24a",
          600: "#a8722a",
          700: "#7a5220",
        },
      },
    },
  },
  plugins: [],
};
