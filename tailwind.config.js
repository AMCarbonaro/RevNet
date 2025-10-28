/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Discord-like color scheme
        discord: {
          dark: '#2C2F33',
          darker: '#23272A',
          darkest: '#1E2124',
          light: '#36393F',
          lighter: '#40444B',
          text: '#DCDDDE',
          textMuted: '#72767D',
          accent: '#5865F2',
          success: '#3BA55D',
          warning: '#FAA61A',
          danger: '#ED4245'
        },
        // Cyberpunk accent colors
        cyberpunk: {
          green: '#39FF14',
          cyan: '#00DDEB',
          purple: '#8B5CF6',
          pink: '#FF6B9D'
        }
      },
      fontFamily: {
        'discord': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['Fira Code', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

