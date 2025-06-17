import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neuro-base flex items-center justify-center p-4">
          <div className="neuro-card max-w-md w-full text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold text-neuro-700 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-neuro-500 mb-6">
              The AI encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="neuro-button-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance monitoring
if (typeof window !== 'undefined') {

  // Performance observer
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
    } catch (e) {
      // Fallback for browsers that don't support these metrics
      console.log('Performance observer not fully supported')
    }
  }
}

// Toast configuration
const toastOptions = {
  duration: 4000,
  position: 'top-center',
  style: {
    background: '#e0e5ec',
    color: '#334155',
    borderRadius: '20px',
    boxShadow: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
    border: 'none',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  success: {
    iconTheme: {
      primary: '#4facfe',
      secondary: '#ffffff'
    }
  },
  error: {
    iconTheme: {
      primary: '#f5576c',
      secondary: '#ffffff'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster toastOptions={toastOptions} />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
)