/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        archivo: 'Archivo',
      },
    },
  },
  plugins: [require('daisyui')],
};
