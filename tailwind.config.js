/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#141211',
          bgLight: '#1c1a17',
          bgCard: 'rgba(35, 32, 28, 0.9)',
          gold: '#d4af37',
          goldLight: '#e5c76b',
          goldDark: '#a68a2a',
          accent: '#2d4a3e',
          accentLight: '#3d6352',
          burgundy: '#722f37',
          text: '#f0ebe3',
          textMuted: '#a69f93',
          textDark: '#6b655c',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
