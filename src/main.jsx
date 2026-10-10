import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

/*
 * Global styles live in ./css (page-specific CSS is imported by
 * each page component):
 *  - variables  → design tokens
 *  - base       → reset, buttons, forms, shared helpers
 *  - layout     → nav, footer, page heads
 *  - components → reusable UI blocks (maps, uploads, tables, notifications…)
 *  - backdrop   → layered, animated ambient background
 *  - motion     → scroll reveals, tilt, float, section bands
 * Imported before App so page-level rules can override shared ones.
 */
import './css/variables.css'
import './css/base.css'
import './css/layout.css'
import './css/components.css'
import './css/backdrop.css'
import './css/motion.css'

import App from './App'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)
