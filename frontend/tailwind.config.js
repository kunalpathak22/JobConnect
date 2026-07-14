/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7ccafd',
          400: '#38adf8',
          500: '#0e92e9',
          600: '#0275c7',
          700: '#035da1',
          800: '#075085',
          900: '#0c436e',
          950: '#082b49',
        }
      }
    },
  },
  plugins: [],
}
