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
      },
      fontFamily: {
        // Tolkien
        "tolkien": ["Tolkien"],
        // Poppins
        "poppins-thin": ["Poppins_100Thin"],
        "poppins-extralight": ["Poppins_200ExtraLight"],
        "poppins-light": ["Poppins_300Light"],
        "poppins": ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
        "poppins-extrabold": ["Poppins_800ExtraBold"],
        "poppins-black": ["Poppins_900Black"],
        // Poppins Italics
        "poppins-thin-it": ["Poppins_100Thin_Italic"],
        "poppins-extralight-it": ["Poppins_200ExtraLight_Italic"],
        "poppins-light-it": ["Poppins_300Light_Italic"],
        "poppins-it": ["Poppins_400Regular_Italic"],
        "poppins-medium-it": ["Poppins_500Medium_Italic"],
        "poppins-semibold-it": ["Poppins_600SemiBold_Italic"],
        "poppins-bold-it": ["Poppins_700Bold_Italic"],
        "poppins-extrabold-it": ["Poppins_800ExtraBold_Italic"],
        "poppins-black-it": ["Poppins_900Black_Italic"],
      },
    },
  },
  plugins: [],
}