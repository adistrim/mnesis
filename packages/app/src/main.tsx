import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatInterface from './App'
import ChatProvider from './context/ChatProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  </StrictMode>,
)
