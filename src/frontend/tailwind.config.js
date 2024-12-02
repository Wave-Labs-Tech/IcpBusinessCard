/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        goldman: ['Goldman', 'sans-serif'],
        anta: ['Anta', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
        rationale: ['Rationale', 'sans-serif'],
        michroma: ['Michroma', 'sans-serif'],
        zendots: ['Zen Dots', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

