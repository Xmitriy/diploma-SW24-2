/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      
      fontFamily: {
        quicksand: ["Quicksand", ...fontFamily.sans],
      },
      colors: {
        blue1: "#708FFF",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
