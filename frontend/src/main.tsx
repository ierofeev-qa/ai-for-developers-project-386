import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApiProvider } from './providers/ApiProvider'
import { MantineThemeProvider } from './providers/MantineThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineThemeProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </MantineThemeProvider>
  </StrictMode>,
)
