import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatProvider from './context/ChatProvider'
import ChatPage from './pages/Chat/ChatPage'
import { ThemeProvider } from './components/theme/theme-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="mnesis-ui-theme">
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    </ThemeProvider>
  </StrictMode>,
)
