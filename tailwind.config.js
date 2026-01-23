/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tetris piece colors
        tetris: {
          I: '#00f0f0',
          O: '#f0f000',
          T: '#a000f0',
          S: '#00f000',
          Z: '#f00000',
          J: '#0000f0',
          L: '#f0a000',
          ghost: 'rgba(255, 255, 255, 0.3)'
        }
      }
    }
  },
  plugins: []
}
