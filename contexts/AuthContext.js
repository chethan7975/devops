import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const router = useRouter()

  // Set up axios defaults
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setToken(token)
    }
  }, [])

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token')
      if (token) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`)
          setUser(response.data.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          Cookies.remove('token')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      })

      const { token: newToken, user: userData } = response.data
      
      // Store token in cookie
      Cookies.set('token', newToken, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      setToken(newToken)
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData, role) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/${role}`, userData)
      
      const { token: newToken, user: newUser } = response.data
      
      // Store token in cookie
      Cookies.set('token', newToken, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      setToken(newToken)
      setUser(newUser)
      
      return { success: true, user: newUser }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    router.push('/')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isVolunteer: user?.role === 'volunteer',
    isNGO: user?.role === 'ngo'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}