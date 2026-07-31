/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    screens: {
      xs:  '375px',   // iPhone SE / small Android
      sm:  '640px',   // large phone landscape / small tablet
      md:  '768px',   // tablet portrait
      lg:  '1024px',  // tablet landscape / small laptop
      xl:  '1280px',  // desktop
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          dark:    '#C1121F',
          light:   '#FF6B7A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
