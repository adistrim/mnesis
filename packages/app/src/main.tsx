import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatProvider from './context/ChatProvider'
import ChatPage from './pages/Chat/ChatPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  </StrictMode>,
)
