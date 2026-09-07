export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'hover-color': 'var(--hover-color)',
        'rvnp-green': '#006400',
        'rvnp-green-light': '#008000',
        'rvnp-green-dark': '#004D00',
        'rvnp-red': '#CC0000',
        'rvnp-white': '#FFFFFF',
      },
      fontFamily: {
        body: 'var(--font-body)',
        heading: 'var(--font-heading)',
      },
    },
  },
  plugins: [],
};