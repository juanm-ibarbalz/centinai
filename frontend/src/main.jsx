import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedToken = localStorage.getItem("token");
if (savedToken && window.Android?.saveToken) {
  window.Android.saveToken(savedToken);
  console.log("📦 Reenviando token al Android WebView");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
