import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ube-soft': '#8B7AE6',
        'ube-deep': '#5E3AAD',
        'ube-royal': '#3C2177',
        mango: '#FFC857',
        gold: '#FFB703',
        teal: '#7FD6C9',
        mint: '#B7E4C7',
        'sky-blue': '#A8D8FF',
        lavender: '#EDE6FF',
        cream: '#FFF8E7',
        'pink-light': '#FFE6E9',
        'slate-dark': '#6C6F7D',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        pixel: '0 8px 0 rgba(30, 18, 74, 0.26)',
        glow: '0 18px 50px rgba(127, 214, 201, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
