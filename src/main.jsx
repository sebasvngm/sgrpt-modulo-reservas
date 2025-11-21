import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Importa tu componente principal
import './index.css' // Importa el CSS con las directivas de Tailwind

// Inicializa y monta la aplicación React en el elemento con id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)