/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(23 37 84)',
          light: 'rgb(37 58 128)',
          dark: 'rgb(15 25 56)',
        },
        accent: {
          DEFAULT: 'rgb(255 152 0)',
          light: 'rgb(255 183 77)',
          dark: 'rgb(230 126 0)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk Variable', 'sans-serif'],
        body: ['Inter Variable', 'sans-serif'],
      },
      boxShadow: {
        'accent': '0 10px 25px -5px rgb(255 152 0 / 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
