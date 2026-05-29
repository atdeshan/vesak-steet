import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vesak palette
        night: {
          DEFAULT: '#050308',
          50: '#1a1428',
          100: '#0a0612',
          900: '#050308',
        },
        flame: {
          50: '#fff8e8',
          100: '#fff0c0',
          200: '#ffeebb',
          300: '#f5d28a',
          400: '#ffd86b',
          500: '#ffa244',
          600: '#ff8533',
          700: '#ff6b35',
          800: '#e94560',
          900: '#3a1f0a',
        },
        sacred: {
          green: '#88c8a0',
          gold: '#f5d28a',
          saffron: '#ff8533',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        sinhala: ['var(--font-sinhala)', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'flicker': 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
