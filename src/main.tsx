import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from '@/app/App'
import { createBrowserServices, ServicesProvider } from '@/app/services'
import '@/styles/global.css'

registerSW({ immediate: true })

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <ServicesProvider services={createBrowserServices()}>
      <App />
    </ServicesProvider>
  </StrictMode>,
)
