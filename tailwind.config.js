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
        // Mezo institutional color palette - BTC-native
        mezo: {
          // Dark backgrounds - institutional grade
          dark: {
            50: '#F8F9FA',   // Pure white text
            100: '#E9ECEF',  // Light gray text
            200: '#DEE2E6',  // Medium gray text
            300: '#CED4DA',  // Muted text
            400: '#ADB5BD',  // Disabled text
            500: '#6C757D',  // Secondary text
            600: '#495057',  // Tertiary text
            700: '#343A40',  // Dark text
            800: '#212529',  // Darker background
            900: '#0D1117',  // Primary background
            950: '#010409',  // Deepest background
          },
          // Bitcoin orange - primary brand
          btc: {
            50: '#FFF4E6',   // Lightest
            100: '#FFE4B3',  // Very light
            200: '#FFD180',  // Light
            300: '#FFB74D',  // Medium light
            400: '#FF9800',  // Medium
            500: '#F7931A',  // Primary Bitcoin orange
            600: '#E8821E',  // Darker
            700: '#D9731A',  // Dark
            800: '#C4621A',  // Darker
            900: '#A0522D',  // Darkest
          },
          // MUSD teal - secondary brand
          musd: {
            50: '#E0F7FA',   // Lightest
            100: '#B2EBF2',  // Very light
            200: '#80DEEA',  // Light
            300: '#4DD0E1',  // Medium light
            400: '#26C6DA',  // Medium
            500: '#00BCD4',  // Primary MUSD teal
            600: '#00ACC1',  // Darker
            700: '#0097A7',  // Dark
            800: '#00838F',  // Darker
            900: '#006064',  // Darkest
          },
          // Neutral grays - institutional
          neutral: {
            50: '#FAFAFA',   // Lightest
            100: '#F5F5F5',  // Very light
            200: '#EEEEEE',  // Light
            300: '#E0E0E0',  // Medium light
            400: '#BDBDBD',  // Medium
            500: '#9E9E9E',  // Primary
            600: '#757575',  // Darker
            700: '#616161',  // Dark
            800: '#424242',  // Darker
            900: '#212121',  // Darkest
          },
        },
        // Legacy colors for compatibility
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b8ff',
          400: '#8691ff',
          500: '#F7931A',  // Updated to Bitcoin orange
          600: '#3b82f6',
          700: '#2563eb',
          800: '#1d4ed8',
          900: '#1e40af',
        },
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#A178FF',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        green: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#3EDC81',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        dark: {
          50: '#1a1b23',
          100: '#121420',
          200: '#0F111A',
          300: '#0a0b0f',
          400: '#050609',
          500: '#000000',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        'glass': '12px',
        'frosted': '16px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'frosted': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'institutional': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'data-update': 'dataUpdate 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(247, 147, 26, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(247, 147, 26, 0.4)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        dataUpdate: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}