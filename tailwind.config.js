// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add the preset here
  presets: [require("nativewind/preset")], 
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        secondary: '#151312',
        accent: '#AB8BFF'
      }
    },
  },
  plugins: [],
}