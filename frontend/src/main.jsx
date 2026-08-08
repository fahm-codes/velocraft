const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const originalFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    input = `${API_BASE_URL}${input}`;
  }
  return originalFetch(input, init);
};
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


