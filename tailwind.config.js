/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Earthy, warm palette reflecting agriculture and rural Rwanda
        forest: {
          50: '#f2f8f1',
          100: '#e0efdd',
          200: '#c2dfbd',
          300: '#98c790',
          400: '#69a95f',
          500: '#498b3f',
          600: '#376f30',
          700: '#2c5828',
          800: '#264623',
          900: '#213b1f',
          950: '#111f10',
        },
        earth: {
          50: '#faf6f0',
          100: '#f2e9db',
          200: '#e4d1b6',
          300: '#d3b287',
          400: '#c29160',
          500: '#b57945',
          600: '#a2623a',
          700: '#864d31',
          800: '#6d402d',
          900: '#5a3628',
        },
        gold: {
          50: '#fdf9ed',
          100: '#f8eecb',
          200: '#f0da93',
          300: '#e8c25a',
          400: '#e2ac34',
          500: '#d9911f',
          600: '#c06e18',
          700: '#a04f18',
          800: '#833e1a',
          900: '#6d3418',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.9s ease-out both',
      },
    },
  },
  plugins: [],
}
