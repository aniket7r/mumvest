/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: '#FF6B6B', light: '#FF8E8E', dark: '#E55555' },
        teal: { DEFAULT: '#4ECDC4', light: '#7EDDD6' },
        cream: '#FFF9F5',
        charcoal: '#2C3E50',
        warmgrey: '#7F8C8D',
        savings: { DEFAULT: '#27AE60', light: '#E8F8F0' },
        amber: { DEFAULT: '#F39C12', light: '#FEF3E2' },
        error: { DEFAULT: '#E74C3C', light: '#FDEDEC' },
        border: '#ECE8E4',
      },
      fontFamily: {
        heading: ['Nunito-Bold'],
        'heading-semi': ['Nunito-SemiBold'],
        body: ['Inter-Regular'],
        'body-medium': ['Inter-Medium'],
        'body-semi': ['Inter-SemiBold'],
        'body-bold': ['Inter-Bold'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.1)',
        xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
