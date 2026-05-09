/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gourmet: {
          bg: '#0F0A06',
          surface: '#1C1208',
          card: '#2A1A0C',
          elevated: '#38220F',
          cream: '#FFF8F0',
          muted: '#CDB9A5',
          line: 'rgba(255, 248, 240, 0.12)',
          primary: '#FF6B35',
          accent: '#F4A523',
          success: '#7BC96F',
          danger: '#FF5A5F',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 24px 70px rgba(255, 107, 53, 0.2)',
        card: '0 24px 80px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'gourmet-radial':
          'radial-gradient(circle at top left, rgba(255,107,53,.18), transparent 32rem), radial-gradient(circle at bottom right, rgba(244,165,35,.12), transparent 30rem)',
      },
    },
  },
  plugins: [],
};
