/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0079bf',
          dark: '#026aa7',
        },
        secondary: '#5aac44',
      }
    },
  },
  plugins: [],
}
