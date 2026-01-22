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
        primary: '#6d0f3a', // Burgundy - main brand color
        secondary: '#4a0a27', // Darker burgundy
        accent: '#6d0f3a', // Burgundy accent
        text: '#262626', // Dark gray text (softer than black)
        'text-gray': '#666666', // Gray text
        'bg-light': '#f5f5f5', // Light gray background
        'border-gray': '#e0e0e0', // Border gray
        'nav-gray': '#e8e8e8', // Navigation bar gray
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        heading: ['Nunito', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // line-clamp plugin removed; included by default in Tailwind 3.3+
  ],
}
export default config 