import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: '#edf5f2',
          100: '#d1e8df',
          200: '#a3d1bf',
          300: '#75ba9f',
          400: '#5b8c7a',
          500: '#4a7364',
          600: '#3d5f53',
          700: '#2f4a41',
          800: '#243830',
          900: '#1a2923',
        },
        azure: {
          50: '#eef4f6',
          100: '#d3e3e9',
          200: '#a7c7d3',
          300: '#7babbd',
          400: '#4a7c8c',
          500: '#3d6878',
          600: '#315764',
          700: '#264550',
          800: '#1d353e',
          900: '#14262c',
        },
        ink: {
          50: '#f7f5f0',
          100: '#e8e3d6',
          200: '#d1c8ad',
          300: '#b8a97e',
          400: '#a08e5a',
          500: '#8c7847',
          600: '#76633d',
          700: '#5f4e34',
          800: '#4d3f2c',
          900: '#3d3325',
          950: '#221c14',
        },
        scroll: {
          50: '#f2f0ed',
          100: '#e6e1d8',
          200: '#cdc3b1',
          300: '#b4a58a',
          400: '#9b8763',
          500: '#887350',
          600: '#735f44',
          700: '#5d4d39',
          800: '#4d3f2f',
          900: '#403428',
          950: '#221c14',
        },
      },
      fontFamily: {
        cjk: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
      },
      backgroundImage: {
        'ink-texture': "url('/ink-texture.png')",
        'ink-wash': "url('/ink-wash-bg.jpg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.75s ease-out',
        'ink-flow': 'inkFlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        inkFlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
