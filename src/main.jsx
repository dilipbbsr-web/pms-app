import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1E2535',
          color: '#E2E8F0',
          border: '1px solid #2A3348',
          borderRadius: '12px',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
        },
        success: { iconTheme: { primary: '#10B981', secondary: '#1E2535' } },
        error:   { iconTheme: { primary: '#EF4444', secondary: '#1E2535' } },
      }}
    />
    <App />
  </React.StrictMode>
)