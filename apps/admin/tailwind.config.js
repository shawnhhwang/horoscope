/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0F1117',
          sidebar: '#161922',
          card: '#1D212C',
          gold: '#E5C378',
          border: 'rgba(229, 195, 120, 0.2)',
          text: '#F0F3F8',
          muted: '#8A92A6',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Noto Serif TC', 'serif'],
        sans: ['Plus Jakarta Sans', 'Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
