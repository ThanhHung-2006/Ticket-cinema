/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F1220',
        card: '#181C2E',
        border: '#2A2F45',
        primary: {
          DEFAULT: '#E11D48',
          hover: '#BE123C',
        },
        gold: {
          DEFAULT: '#F5B301',
          hover: '#D99B00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
