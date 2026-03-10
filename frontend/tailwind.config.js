/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        claude:  '#C9A96E',
        gpt54:   '#6EC9A9',
        gemini:  '#6EA9C9',
        grok:    '#C96E6E',
        mistral: '#A96EC9',
      },
    },
  },
  plugins: [],
};
