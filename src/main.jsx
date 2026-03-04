import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NavProvider } from './utils/providers/navProvider'
import { LanguageProvider } from './utils/providers/lang/langProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <NavProvider>
          <App />
        </NavProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
