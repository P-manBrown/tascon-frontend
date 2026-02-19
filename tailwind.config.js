/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: [
          'Helvetica Neue',
          'Arial',
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans',
          'Meiryo',
          'sans-serif',
        ],
      },
      colors: {
        theme: '#F5F7FC',
        'ctnr-orange': '#DE8663',
        'ctnr-blue': '#345BAA',
        'ctnr-green': '#508374',
        'ctnr-yellow': '#7E611F',
        'ctnr-purple': '#5D355B',
        'ctnr-red': '#B1624D',
        'ctnr-gray': '#6F747E',
        'ctnr-pink': '#F2367E',
      },
      animation: {
        'scale-in-center':
          'scale-in-center 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'scale-out-center':
          'scale-out-center 0.2s cubic-bezier(0.550, 0.085, 0.680, 0.530) both',
        'slide-in-top':
          'slide-in-top 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'slide-out-top':
          'slide-out-top 0.2s cubic-bezier(0.550, 0.085, 0.680, 0.530) both',
        'slide-in-bottom':
          'slide-in-bottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'slide-out-bottom':
          'slide-out-bottom 0.2s cubic-bezier(0.550, 0.085, 0.680, 0.530) both',
        'slide-in-left':
          'slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'fade-in-delayed': 'fade-in 0.2s ease-in-out 0.1s both',
        'expand-collapse': 'expand-collapse 2s ease-in-out infinite both',
      },
      keyframes: {
        'scale-in-center': {
          '0%': {
            transform: 'scale(0)',
            opacity: '1',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'scale-out-center': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          to: {
            transform: 'scale(0)',
            opacity: '1',
          },
        },
        'slide-in-top': {
          '0%': {
            transform: 'translateY(-1000px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-out-top': {
          '0%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
          to: {
            transform: 'translateY(-1000px)',
            opacity: '0',
          },
        },
        'slide-in-bottom': {
          '0%': {
            transform: 'translateY(1000px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-out-bottom': {
          '0%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
          to: {
            transform: 'translateY(1000px)',
            opacity: '0',
          },
        },
        'slide-in-left': {
          '0%': {
            transform: 'translateX(-1000px)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'expand-collapse': {
          '0%, 100%': {
            transform: 'translate(0px, 0px)',
            'box-shadow': '0 0px 0px 0 rgb(0 0 0 / 0)',
          },
          '22.5%, 77.5%': {
            transform: 'translate(0px, 0px)',
            'box-shadow': '0 3px 6px 0 rgb(0 0 0 / 0.025)',
          },
          '45%, 55%': {
            transform: 'translate(var(--end-x), var(--end-y))',
            'box-shadow': '0 3px 6px 0 rgb(0 0 0 / 0.2)',
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities }) {
      addBase({
        'button:not(:disabled), [role="button"]:not(:disabled)': {
          cursor: 'pointer',
        },
      })
      addComponents({
        '.skeleton': {
          '@apply animate-pulse bg-gray-300': {},
        },
        '.label': {
          '@apply mb-1 text-sm font-bold': {},
        },
        '.text-box': {
          // TEMP: Add 'bg-white' to avoid the background becoming transparent.
          //   See https://github.com/tailwindlabs/tailwindcss/issues/17646
          '@apply block min-h-[2.75rem] w-full rounded-none border border-gray-300 px-2.5 focus:border-blue-600 focus:outline-none bg-white':
            {},
        },
        '.text-box-error': {
          '@apply border-red-600 bg-red-50 focus:border-red-600 focus:bg-white':
            {},
        },
        '.link': {
          '@apply text-blue-600 hover:underline': {},
        },
        '.shape-btn': {
          '@apply h-11 w-full rounded-sm': {},
        },
        '.btn': {
          '@apply shape-btn inline-flex items-center justify-center whitespace-nowrap text-lg font-semibold':
            {},
        },
        '.btn-ghost': {
          '@apply duration-200 hover:bg-black/10 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent':
            {},
        },
        '.btn-shadow': {
          '@apply shadow-md shadow-black/30 duration-200 hover:shadow-none disabled:shadow-none':
            {},
        },
        '.btn-disabled': {
          '@apply cursor-not-allowed bg-gray-400 text-white': {},
        },
        '.btn-primary': {
          '@apply btn-shadow bg-blue-600 text-white disabled:btn-disabled disabled:duration-0':
            {},
        },
        '.btn-danger': {
          '@apply btn-shadow bg-red-600 text-white disabled:btn-disabled disabled:duration-0':
            {},
        },
        '.btn-success': {
          '@apply btn-shadow bg-green-700 text-white disabled:btn-disabled disabled:duration-0':
            {},
        },
        '.btn-outline-disabled': {
          '@apply cursor-not-allowed border-2 border-gray-400 text-gray-400':
            {},
        },
        '.btn-outline-danger': {
          '@apply btn-shadow border-2 border-red-600 bg-white text-red-600 disabled:btn-outline-disabled disabled:duration-0':
            {},
        },
        '.btn-outline-success': {
          '@apply btn-shadow border-2 border-green-700 bg-white text-green-700 disabled:btn-outline-disabled disabled:duration-0':
            {},
        },
        '.btn-icon': {
          '@apply btn-ghost inline-flex items-center justify-center rounded-sm p-0.5 disabled:cursor-wait disabled:bg-transparent disabled:duration-0':
            {},
        },
        '.clickable-avatar': {
          '@apply duration-200 hover:brightness-75 rounded-full': {},
        },
      })
      addUtilities({
        '.px-safe': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.mb-safe': {
          'margin-bottom': 'env(safe-area-inset-bottom)',
        },
        '.hidden-scrollbar': {
          'scrollbar-width': 'none',
        },
        '.text-center-auto': {
          'margin-inline': 'auto',
          'max-inline-size': 'max-content',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      })
    }),
  ],
}
