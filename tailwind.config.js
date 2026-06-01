/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#6C63FF',
        brandl: '#8B85FF',
        brands: '#4B44CC',
        surf: '#1E1E2E',
        card: '#252535',
        cardb: '#2D2D42',
        border: '#3A3A52',
        muted: '#9090B0',
        cream: '#F5C842',
        peach: '#FF8C5A',
        sky: '#5AB4FF',
        grn: '#4ADE80',
        red: '#FF5A5A',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 