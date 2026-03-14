import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NavProvider } from './utils/providers/navProvider'
import { LanguageProvider } from './utils/providers/lang/langProvider'
import { ProjectsProvider } from './utils/providers/projectsProvider'
import { PageTransitionProvider } from './utils/providers/pageTransitionProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <NavProvider>
          <PageTransitionProvider>
            <ProjectsProvider>
              <App />
            </ProjectsProvider>
          </PageTransitionProvider>
        </NavProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
