/** @type {import('tailwindcss').Config} */
// v4: arquivo opcional, mas útil para indicar onde escanear classes
export default {
  content: [
    "./index.html",                 // <- Vite HTML
    "./src/**/*.{js,ts,jsx,tsx}"    // <- Seus componentes/páginas
  ],
  theme: {
    extend: {}, // <- personalize cores/ fontes aqui depois
  },
  plugins: [], // <- ex.: forms, typography, etc.
};
