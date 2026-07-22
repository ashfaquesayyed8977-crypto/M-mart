/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0faf0',
          100: '#dcf5dc',
          200: '#bbebbb',
          300: '#85d985',
          400: '#4ec44e',
          500: '#2da52d',
          600: '#228722',
          700: '#1a6b1a',
          800: '#165516',
          900: '#124312',
          950: '#081f08',
        },
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.07)',
        'card-hover': '0 6px 24px 0 rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
