/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        background: '#121212',
        surface: '#1e1e1e',
        primary: '#6200ee',
        'on-primary': '#ffffff',
        'on-surface': '#e1e1e1',
        'on-surface-secondary': '#a0a0a0',
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  plugins: [],
}