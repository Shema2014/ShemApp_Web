/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // azul-marinho — cor primária (botões, navegação, cabeçalhos)
        brand: {
          50: "#EEF2F8",
          100: "#D7E0EE",
          200: "#AFC1DD",
          400: "#3E5A82",
          600: "#122A4E",
          700: "#0B1D38",
          900: "#050D1A",
        },
        // dourado — cor de destaque (acordes, detalhes, ícones especiais)
        gold: {
          400: "#E3C583",
          500: "#C9A24D",
          600: "#A9822E",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
