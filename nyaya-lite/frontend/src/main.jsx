import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import './i18n'; // Initialize i18n

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ErrorBoundary>
                <ThemeProvider>
                    <Toaster position="top-center" toastOptions={{
                        style: {
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                        },
                    }} />
                    <App />
                </ThemeProvider>
            </ErrorBoundary>
        </BrowserRouter>
    </React.StrictMode>,
)
