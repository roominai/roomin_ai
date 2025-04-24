/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "330px",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0d8de3',
          600: '#0070cc',
          700: '#0059a5',
          800: '#064b87',
          900: '#0a3f70',
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 112, 204, 0.12)',
        'card-hover': '0 8px 30px -4px rgba(0, 112, 204, 0.18)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@headlessui/tailwindcss")],
};
