import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  CalendarDaysIcon, 
  TrophyIcon, 
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'

export default function VolunteerDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAttendance, setMarkingAttendance] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'volunteer') {
      router.push('/auth/login')
      return
    }
    
    fetchStats()
    fetchCertificates()
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    }
  }

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/certificates/volunteer`)
      setCertificates(response.data)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async () => {
    setMarkingAttendance(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`)
      toast.success('Attendance marked successfully!')
      fetchStats() // Refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setMarkingAttendance(false)
    }
  }

  const downloadCertificate = async (certificateId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/download/${certificateId}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${certificateId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Failed to download certificate')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Volunteer Dashboard - VolunteerHub</title>
        <meta name="description" content="Your volunteer dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gradient">VolunteerHub</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="btn btn-outline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Keep track of your volunteer service and achievements.
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Service Days</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.serviceDays}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Days to Certificate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.daysUntilCertificate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-info-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-info-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">NGO</p>
                    <p className="text-lg font-bold text-gray-900">{stats.ngoName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mark Attendance Section */}
          <div className="card mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mark Today's Service
              </h2>
              <p className="text-gray-600 mb-6">
                Did you volunteer today? Mark your attendance to track your service days.
              </p>
              <button
                onClick={markAttendance}
                disabled={markingAttendance}
                className="btn btn-primary text-lg px-8 py-3"
              >
                {markingAttendance ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    I Served Today
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Section */}
          {stats && (
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Progress to Next Certificate</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Service Days</span>
                  <span>{stats.serviceDays} / {stats.certificateThreshold}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((stats.serviceDays / stats.certificateThreshold) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              {stats.isEligibleForCertificate && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <p className="text-success-800 font-medium">
                    🎉 Congratulations! You're eligible for a certificate. Contact your NGO admin to issue one.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Certificates Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Certificates</h2>
            {certificates.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No certificates yet. Keep volunteering to earn your first certificate!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((certificate) => (
                  <div key={certificate._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{certificate.ngoName}</h3>
                      <span className="badge badge-success">Verified</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Service Days: {certificate.serviceDays}</p>
                      <p>Issued: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                      <p>Code: {certificate.verificationCode}</p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => downloadCertificate(certificate._id)}
                        className="btn btn-primary text-sm flex-1"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => window.open(`/verify/${certificate.verificationCode}`, '_blank')}
                        className="btn btn-outline text-sm"
                      >
                        <QrCodeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}