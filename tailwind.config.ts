import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565D8',
          light:   '#4F8FF5',
          dark:    '#143B7D',
        },
        green: {
          DEFAULT: '#18B55A',
          light:   '#57D66E',
        },
        cyan:    { DEFAULT: '#18B8E6' },
        navy:    { DEFAULT: '#143B7D' },
        border:  { DEFAULT: '#DCE3EC' },
        bg:      { DEFAULT: '#F8FAFC' },
        surface: { DEFAULT: '#FFFFFF' },
        success: { DEFAULT: '#16A34A' },
        warning: { DEFAULT: '#F59E0B' },
        error:   { DEFAULT: '#DC2626' },
        info:    { DEFAULT: '#2563EB' },
        text: {
          primary:   '#1F2937',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #1565D8 0%, #18B8E6 45%, #18B55A 100%)',
        'gradient-dark':    'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(21,101,216,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(21,101,216,0.1)',
      },
      animation: {
        'ecg': 'ecg 3s linear infinite',
        'count-up': 'count-up 0.5s ease-out',
        'pulse-heart': 'pulse-heart 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        ecg: {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'pulse-heart': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
