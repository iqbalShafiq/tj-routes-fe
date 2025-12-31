/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Background colors */
        bg: {
          main: 'rgb(var(--color-bg-main) / <alpha-value>)',
          subtle: 'rgb(var(--color-bg-subtle) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
          sidebar: 'rgb(var(--color-bg-sidebar) / <alpha-value>)',
          hover: 'rgb(var(--color-bg-hover) / <alpha-value>)',
        },
        /* Text colors */
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        },
        /* Accent color - Teal */
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          hover: 'rgb(var(--color-accent-hover))',
          subtle: 'rgb(var(--color-accent-subtle) / <alpha-value>)',
          muted: 'rgb(var(--color-accent-muted) / <alpha-value>)',
        },
        /* Border color */
        border: {
          DEFAULT: 'rgb(var(--color-border))',
          focus: 'rgb(var(--color-border-focus))',
        },
        /* Status colors */
        success: {
          DEFAULT: 'rgb(var(--color-success))',
          bg: 'rgb(var(--color-success-bg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning))',
          bg: 'rgb(var(--color-warning-bg) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error))',
          bg: 'rgb(var(--color-error-bg) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info))',
          bg: 'rgb(var(--color-info-bg) / <alpha-value>)',
        },
        /* Tertiary color - Terracotta */
        tertiary: {
          DEFAULT: 'rgb(var(--color-tertiary))',
          hover: 'rgb(var(--color-tertiary-hover))',
          muted: 'rgb(var(--color-tertiary-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk Variable', 'sans-serif'],
        body: ['Inter Variable', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        'card': '0.5rem',
        'button': '0.375rem',
        'badge': '9999px',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
