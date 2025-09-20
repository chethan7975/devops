import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default MyApp