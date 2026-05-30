/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lemon: {
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF176',
          300: '#FFEE58',
          400: '#FFCA28',
          500: '#FFD600', // signature yellow
          600: '#F5C000',
          700: '#E6A800',
          800: '#CC8800',
          900: '#A86600',
        },
        brand: {
          black:  '#111111',
          white:  '#FAFAFA',
          coral:  '#FF6B6B',
          nude:   '#E8C4A0',
          berry:  '#8E44AD',
          rose:   '#C0392B',
        },
      },
      fontFamily: {
        sans:    ['var(--font-be-vietnam)', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'lemon-glow': '0 0 20px rgba(255, 214, 0, 0.4)',
        'brand-card': '0 4px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'lemon-gradient': 'linear-gradient(135deg, #FFD600 0%, #FFCA28 50%, #F5C000 100%)',
        'dark-gradient':  'linear-gradient(180deg, #111111 0%, #1a1a1a 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 12px rgba(255,214,0,0.3)' }, '50%': { boxShadow: '0 0 28px rgba(255,214,0,0.6)' } },
      },
    },
  },
  plugins: [],
}
