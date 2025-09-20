import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [ngos, setNgos] = useState([])
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalServiceDays: 0,
    totalNGOs: 0
  })

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
    fetchStats()
    fetchNGOs()
  }, [])

  const fetchStats = async () => {
    try {
      // This would be a real API call in production
      setStats({
        totalVolunteers: 1250,
        totalServiceDays: 15680,
        totalNGOs: 45
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchNGOs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ngos?limit=6`)
      setNgos(response.data.ngos)
    } catch (error) {
      console.error('Error fetching NGOs:', error)
    }
  }

  return (
    <>
      <Head>
        <title>NGO Volunteer Management System</title>
        <meta name="description" content="Connect volunteers with NGOs and track service hours" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gradient">VolunteerHub</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="btn btn-outline">
                  Login
                </Link>
                <Link href="/auth/register" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Make a Difference,{' '}
              <span className="text-gradient">One Day at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with NGOs, track your volunteer service, and earn certificates 
              for your contributions to the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=volunteer" className="btn btn-primary text-lg px-8 py-3">
                Start Volunteering
              </Link>
              <Link href="/auth/register?role=ngo" className="btn btn-outline text-lg px-8 py-3">
                Register Your NGO
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stats.totalVolunteers.toLocaleString()}+
                </div>
                <div className="text-gray-600">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success-600 mb-2">
                  {stats.totalServiceDays.toLocaleString()}+
                </div>
                <div className="text-gray-600">Service Days</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-warning-600 mb-2">
                  {stats.totalNGOs}+
                </div>
                <div className="text-gray-600">Partner NGOs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Simple steps to start making an impact
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Register</h3>
                <p className="text-gray-600">
                  Sign up as a volunteer or NGO and get verified by our team.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Service</h3>
                <p className="text-gray-600">
                  Mark your daily service and track your contribution hours.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Certificates</h3>
                <p className="text-gray-600">
                  Get recognized with digital certificates for your service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured NGOs */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Partner NGOs
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of volunteers making a difference
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngos.map((ngo) => (
                <div key={ngo._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    {ngo.logo ? (
                      <img 
                        src={ngo.logo} 
                        alt={ngo.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">
                          {ngo.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{ngo.name}</h3>
                      <p className="text-sm text-gray-600">{ngo.totalVolunteers} volunteers</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ngo.description || 'Making a positive impact in the community.'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {ngo.totalServiceDays} service days
                    </span>
                    <Link 
                      href={`/auth/register?role=volunteer&ngo=${ngo._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Join →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join our community of volunteers and start tracking your impact today.
            </p>
            <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
              Get Started Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">VolunteerHub</h3>
              <p className="text-gray-400 mb-4">
                Connecting volunteers with NGOs for a better tomorrow.
              </p>
              <p className="text-gray-500 text-sm">
                © 2024 VolunteerHub. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}