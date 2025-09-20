import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [step, setStep] = useState(1) // 1: Role selection, 2: Form
  const [role, setRole] = useState('')
  const [ngos, setNGOs] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    ngoId: '',
    description: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      if (user.role === 'volunteer') {
        router.push('/volunteer/dashboard')
      } else if (user.role === 'ngo') {
        router.push('/ngo/dashboard')
      }
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Get role from URL params
    const { role: urlRole, ngo } = router.query
    if (urlRole) {
      setRole(urlRole)
      setStep(2)
    }
    if (ngo) {
      setFormData(prev => ({ ...prev, ngoId: ngo }))
    }
  }, [router.query])

  useEffect(() => {
    if (role === 'volunteer') {
      fetchNGOs()
    }
  }, [role])

  const fetchNGOs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ngos?limit=100`)
      setNGOs(response.data.ngos)
    } catch (error) {
      console.error('Error fetching NGOs:', error)
    }
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        setLoading(false)
        return
      }

      // Prepare data based on role
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      }

      if (role === 'volunteer') {
        submitData.ngoId = formData.ngoId
      } else if (role === 'ngo') {
        submitData.description = formData.description
        submitData.website = formData.website
      }

      const result = await register(submitData, role)
      
      if (result.success) {
        toast.success('Registration successful!')
        if (result.user.role === 'volunteer') {
          if (result.user.isApproved) {
            router.push('/volunteer/dashboard')
          } else {
            toast.success('Your account is pending approval from the NGO admin.')
            router.push('/auth/login')
          }
        } else if (result.user.role === 'ngo') {
          router.push('/ngo/dashboard')
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <>
        <Head>
          <title>Register - VolunteerHub</title>
          <meta name="description" content="Join VolunteerHub as a volunteer or NGO" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Join VolunteerHub</h2>
              <p className="mt-2 text-gray-600">Choose how you'd like to contribute</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="card cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary-200"
                onClick={() => handleRoleSelect('volunteer')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">I'm a Volunteer</h3>
                  <p className="text-gray-600 mb-4">
                    Join NGOs, track your service days, and earn certificates for your contributions.
                  </p>
                  <div className="btn btn-outline">Register as Volunteer</div>
                </div>
              </div>

              <div 
                className="card cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary-200"
                onClick={() => handleRoleSelect('ngo')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">I'm an NGO</h3>
                  <p className="text-gray-600 mb-4">
                    Register your organization, manage volunteers, and issue certificates.
                  </p>
                  <div className="btn btn-outline">Register as NGO</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Register as {role === 'volunteer' ? 'Volunteer' : 'NGO'} - VolunteerHub</title>
        <meta name="description" content={`Register as a ${role} on VolunteerHub`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Register as {role === 'volunteer' ? 'Volunteer' : 'NGO'}
            </h2>
            <p className="mt-2 text-gray-600">
              {role === 'volunteer' 
                ? 'Join our community of volunteers' 
                : 'Register your organization'
              }
            </p>
          </div>

          <div className="card">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="label">
                  {role === 'volunteer' ? 'Full Name' : 'Organization Name'}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'volunteer' ? 'Enter your full name' : 'Enter organization name'}
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              {role === 'volunteer' && (
                <div>
                  <label htmlFor="ngoId" className="label">
                    Select NGO
                  </label>
                  <select
                    id="ngoId"
                    name="ngoId"
                    required
                    className="input"
                    value={formData.ngoId}
                    onChange={handleChange}
                  >
                    <option value="">Choose an NGO</option>
                    {ngos.map((ngo) => (
                      <option key={ngo._id} value={ngo._id}>
                        {ngo.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'ngo' && (
                <>
                  <div>
                    <label htmlFor="description" className="label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="input"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your organization's mission"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="label">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="input"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="address" className="label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  className="input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}