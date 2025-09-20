import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  UsersIcon, 
  CalendarDaysIcon, 
  TrophyIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function NGODashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [pendingVolunteers, setPendingVolunteers] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user || user.role !== 'ngo') {
      router.push('/auth/login')
      return
    }
    
    fetchDashboard()
    fetchVolunteers()
    fetchPendingVolunteers()
    fetchCertificates()
  }, [user, router])

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ngos/dashboard/${user._id}`)
      setDashboard(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/volunteers/${user._id}`)
      setVolunteers(response.data.volunteers)
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    }
  }

  const fetchPendingVolunteers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/volunteers/pending`)
      setPendingVolunteers(response.data)
    } catch (error) {
      console.error('Error fetching pending volunteers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/certificates/ngo/${user._id}`)
      setCertificates(response.data)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    }
  }

  const approveVolunteer = async (volunteerId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/volunteers/${volunteerId}/approve`)
      toast.success('Volunteer approved successfully!')
      fetchPendingVolunteers()
      fetchVolunteers()
    } catch (error) {
      toast.error('Failed to approve volunteer')
    }
  }

  const rejectVolunteer = async (volunteerId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/volunteers/${volunteerId}/reject`)
      toast.success('Volunteer rejected')
      fetchPendingVolunteers()
    } catch (error) {
      toast.error('Failed to reject volunteer')
    }
  }

  const generateCertificate = async (volunteerId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/certificates/generate`, {
        volunteerId
      })
      toast.success('Certificate generated successfully!')
      fetchCertificates()
      fetchVolunteers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate certificate')
    }
  }

  const updateThreshold = async (threshold) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/ngos/certificate-threshold`, {
        threshold: parseInt(threshold)
      })
      toast.success('Certificate threshold updated!')
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to update threshold')
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
        <title>NGO Dashboard - VolunteerHub</title>
        <meta name="description" content="Your NGO dashboard" />
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
                <span className="text-gray-700">{user?.name}</span>
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
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Manage your volunteers and track their contributions.
            </p>
          </div>

          {/* Stats Cards */}
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalVolunteers}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <CalendarDaysIcon className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Service Days</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.stats.totalServiceDays}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificate Threshold</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.stats.certificateThreshold} days</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-info-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-info-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: UsersIcon },
                  { id: 'volunteers', name: 'Volunteers', icon: UserPlusIcon },
                  { id: 'certificates', name: 'Certificates', icon: DocumentTextIcon },
                  { id: 'settings', name: 'Settings', icon: CogIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 inline mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Volunteers */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Volunteers</h3>
                <div className="space-y-3">
                  {dashboard?.recentVolunteers?.map((volunteer) => (
                    <div key={volunteer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{volunteer.name}</p>
                        <p className="text-sm text-gray-600">{volunteer.serviceDays} service days</p>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Volunteers */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Volunteers</h3>
                <div className="space-y-3">
                  {dashboard?.topVolunteers?.map((volunteer, index) => (
                    <div key={volunteer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{volunteer.name}</p>
                          <p className="text-sm text-gray-600">{volunteer.serviceDays} service days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              {/* Pending Approvals */}
              {pendingVolunteers.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                  <div className="space-y-3">
                    {pendingVolunteers.map((volunteer) => (
                      <div key={volunteer._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{volunteer.name}</p>
                          <p className="text-sm text-gray-600">{volunteer.email}</p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(volunteer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveVolunteer(volunteer._id)}
                            className="btn btn-success text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectVolunteer(volunteer._id)}
                            className="btn btn-error text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Volunteers */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Volunteers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {volunteers.map((volunteer) => (
                        <tr key={volunteer._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {volunteer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.serviceDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${volunteer.isApproved ? 'badge-success' : 'badge-warning'}`}>
                              {volunteer.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {volunteer.isApproved && volunteer.serviceDays >= dashboard?.stats?.certificateThreshold && (
                              <button
                                onClick={() => generateCertificate(volunteer._id)}
                                className="btn btn-primary text-sm"
                              >
                                Issue Certificate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issued Certificates</h3>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No certificates issued yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate) => (
                    <div key={certificate._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{certificate.volunteerName}</h4>
                        <span className="badge badge-success">Active</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Service Days: {certificate.serviceDays}</p>
                        <p>Issued: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                        <p>Code: {certificate.verificationCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="label">
                    Certificate Threshold (days)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      defaultValue={dashboard?.stats?.certificateThreshold}
                      className="input w-32"
                      onBlur={(e) => updateThreshold(e.target.value)}
                    />
                    <span className="text-sm text-gray-600">
                      Volunteers need this many service days to be eligible for a certificate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}