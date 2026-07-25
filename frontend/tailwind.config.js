/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f8",
          100: "#fce7f3",
          400: "#e1306c",
          500: "#c13584",
          600: "#833ab4",
          700: "#5851db",
        },
      },
    },
  },
  plugins: [],
};
