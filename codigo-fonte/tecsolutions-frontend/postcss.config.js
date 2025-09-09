// v4: usa o plugin unificado @tailwindcss/postcss
// Ele já cuida de Tailwind, nesting e autoprefixer
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // << esse é o plugin certo no v4
  },
};
