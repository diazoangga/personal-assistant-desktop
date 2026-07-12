/** @type {import('tailwindcss').Config} */
// "Observatory" design system — see personal-assistant/docs/DESKTOP_REDESIGN_PLAN.md §5.1.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14', // canvas — cool blue-black
        slate: '#12161F', // surface — sidebar, panels, cards
        signal: {
          agent: '#B79CFF', // violet
          tool: '#5CC8FF', // cyan
          skill: '#FFC55C', // amber
          llm: '#8A94A6', // slate
          worker: '#4ADE9E', // mint
        },
        action: '#2FD98A',
        alert: '#FF6B6B',
      },
      fontFamily: {
        // Instrument chrome (grotesk), data/trace (mono), reading (serif answer column).
        sans: ['"Inter Tight"', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};
