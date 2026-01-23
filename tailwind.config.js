/** @type {import('tailwindcss').Config} */
import { TETRIS_COLORS, BOARD_COLORS } from './src/renderer/src/constants/tetris'

export default {
  content: ['./index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tetris: { ...TETRIS_COLORS, ...BOARD_COLORS }
      }
    }
  },
  plugins: []
}
