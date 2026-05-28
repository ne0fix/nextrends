// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Config = any;

export const baseConfig: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d5fe',
          300: '#9ab8fc',
          400: '#6892f8',
          500: '#3d65f4',
          600: '#2a47e9',
          700: '#2135d6',
          800: '#212dac',
          900: '#202c88',
          950: '#171d55',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
