/** @type {import('tailwindcss').Config} */
export default {
  // Las rutas de contenido son correctas para escanear archivos React dentro de src/
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Puedes añadir temas personalizados aquí si lo necesitas
    },
  },
  plugins: [],
}