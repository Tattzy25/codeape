/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neumorphism base colors
        neuro: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          base: '#e0e5ec',
          light: '#ffffff',
          dark: '#a3b1c6'
        },
        // AI Chat gradients
        primary: {
          from: '#667eea',
          to: '#764ba2'
        },
        secondary: {
          from: '#4ecdc4',
          to: '#45b7d1'
        },
        accent: {
          from: '#f093fb',
          to: '#f5576c'
        },
        success: {
          from: '#4facfe',
          to: '#00f2fe'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ]
      },
      boxShadow: {
        // Neumorphism shadows
        'neuro-inset': 'inset 8px 8px 16px #a3b1c6, inset -8px -8px 16px #ffffff',
        'neuro-outset': '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'neuro-pressed': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
        'neuro-hover': '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
        'neuro-soft': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'neuro-card': '20px 20px 40px #a3b1c6, -20px -20px 40px #ffffff'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.5s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      backgroundSize: {
        'gradient-x': '200% 200%'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'neuro': '20px',
        'neuro-lg': '30px',
        'neuro-xl': '40px'
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.neuro-button': {
          background: '#e0e5ec',
          borderRadius: '20px',
          boxShadow: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff'
          },
          '&:active': {
            boxShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff'
          }
        },
        '.neuro-card': {
          background: '#e0e5ec',
          borderRadius: '30px',
          boxShadow: '20px 20px 40px #a3b1c6, -20px -20px 40px #ffffff'
        },
        '.neuro-input': {
          background: '#e0e5ec',
          borderRadius: '15px',
          boxShadow: 'inset 8px 8px 16px #a3b1c6, inset -8px -8px 16px #ffffff',
          border: 'none',
          outline: 'none'
        },
        '.gradient-primary': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        '.gradient-secondary': {
          background: 'linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%)'
        },
        '.gradient-accent': {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        '.gradient-success': {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
      }
      addUtilities(newUtilities)
    }
  ],
}