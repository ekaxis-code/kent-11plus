/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#FFFFFF',
          surface: '#F7F7F5',
          hover: '#F1F1EF',
          border: '#E9E9E7',
          text: '#37352F',
          secondary: '#787774',
          muted: '#9B9A97',
          green: {
            bg: '#EDF3EC',
            text: '#2B593F',
            border: '#D4E4D2',
          },
          blue: {
            bg: '#E7F3F8',
            text: '#1F6C9C',
            border: '#C9E4F0',
          },
          amber: {
            bg: '#FBF3DB',
            text: '#89632A',
            border: '#F1E0B5',
          },
          red: {
            bg: '#FDEBEC',
            text: '#9E3632',
            border: '#F5D0D2',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
