import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 深色主題 - 星淵夜幕 (Void Obsidian)
        dark: {
          void: '#08090C',
          nebula: '#10121A',
          card: '#141724',
          gold: '#E5C378',
          violet: '#7B61FF',
          text: '#F0F3F8',
          muted: '#8A92A6',
          border: 'rgba(229, 195, 120, 0.18)',
        },
        // 淺色主題 - 晨曦天盤 (Solstice Alabaster)
        light: {
          bg: '#F9F8F5',
          card: '#FFFFFF',
          bronze: '#A47E3B',
          ink: '#1F2432',
          text: '#1A1C23',
          muted: '#667085',
          border: 'rgba(164, 126, 59, 0.22)',
        },
        // 後台管理中樞專用色彩 (Admin Portal)
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
      boxShadow: {
        cosmic: '0 0 35px -5px rgba(229, 195, 120, 0.25)',
        'cosmic-lg': '0 0 60px -10px rgba(123, 97, 255, 0.3)',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', 'html.light &');
    }),
  ],
};
