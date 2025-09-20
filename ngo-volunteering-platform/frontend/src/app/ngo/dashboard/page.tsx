'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface NGODashboardData {
  ngo: {
    name: string;
    description?: string;
    certificateThreshold: number;
    logo?: string;
  };
  stats: {
    totalVolunteers: number;
    approvedVolunteers: number;
    pendingApprovals: number;
    totalServiceDays: number;
    certificatesIssued: number;
    eligibleForCertificate: number;
  };
  volunteers: any[];
  topVolunteers: any[];
  recentActivity: any[];
  eligibleForCertificate: any[];
}

export default function NGODashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<NGODashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newThreshold, setNewThreshold] = useState<number>(30);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ngo') {
      router.push('/login');
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/ngo/dashboard');
      setDashboardData(response.data.data);
      setNewThreshold(response.data.data.ngo.certificateThreshold);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCertificateThreshold = async () => {
    try {
      setIsUpdatingThreshold(true);
      await api.put('/ngo/certificate-threshold', { threshold: newThreshold });
      toast.success('Certificate threshold updated successfully');
      loadDashboardData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update threshold';
      toast.error(message);
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  const approveVolunteer = async (volunteerId: string, approved: boolean) => {
    try {
      await api.put(`/ngo/volunteers/${volunteerId}/approve`, { approved });
      toast.success(`Volunteer ${approved ? 'approved' : 'rejected'} successfully`);
      loadDashboardData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update volunteer status';
      toast.error(message);
    }
  };

  const issueCertificate = async (volunteerId: string) => {
    try {
      await api.post(`/certificates/issue/${volunteerId}`);
      toast.success('Certificate issued successfully!');
      loadDashboardData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to issue certificate';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <button
            onClick={loadDashboardData}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { ngo, stats, topVolunteers, recentActivity, eligibleForCertificate } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {ngo.name} Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your volunteers and track their progress
              </p>
            </div>
            <button
              onClick={() => router.push('/ngo/volunteers')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Manage Volunteers
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedVolunteers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Service Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServiceDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates Issued</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certificatesIssued}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Eligible for Certificate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eligibleForCertificate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Approvals */}
            {stats.pendingApprovals > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pending Approvals ({stats.pendingApprovals})
                    </h2>
                    <button
                      onClick={() => router.push('/ngo/volunteers?approved=false')}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dashboardData.volunteers
                      .filter(v => !v.isApproved)
                      .slice(0, 3)
                      .map((volunteer) => (
                        <div key={volunteer.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {volunteer.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                              <p className="text-sm text-gray-500">{volunteer.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveVolunteer(volunteer.id, true)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => approveVolunteer(volunteer.id, false)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Eligible for Certificates */}
            {eligibleForCertificate.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Ready for Certificates ({eligibleForCertificate.length})
                    </h2>
                    <button
                      onClick={() => router.push('/ngo/certificates')}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {eligibleForCertificate.slice(0, 3).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {volunteer.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                            <p className="text-sm text-gray-500">
                              {volunteer.serviceDays} days completed
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => issueCertificate(volunteer.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <TrophyIcon className="h-4 w-4 mr-1" />
                            Issue Certificate
                          </button>
                          <button
                            onClick={() => router.push(`/ngo/volunteers/${volunteer.id}`)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Volunteers */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top Volunteers
                  </h2>
                  <button
                    onClick={() => router.push('/ngo/volunteers?sortBy=serviceDays')}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View leaderboard
                  </button>
                </div>

                <div className="space-y-3">
                  {topVolunteers.slice(0, 5).map((volunteer, index) => (
                    <div key={volunteer.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-500' :
                          index === 2 ? 'text-yellow-700' : 'text-gray-400'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center ml-3">
                        <span className="text-sm font-medium text-gray-700">
                          {volunteer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                        <p className="text-sm text-gray-500">{volunteer.serviceDays} service days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificate Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CogIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Certificate Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days required for certificate
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  
                  <button
                    onClick={updateCertificateThreshold}
                    disabled={isUpdatingThreshold || newThreshold === ngo.certificateThreshold}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingThreshold ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Threshold'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {volunteer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                          <p className="text-xs text-gray-500">
                            Last served: {volunteer.lastServiceDate ? 
                              new Date(volunteer.lastServiceDate).toLocaleDateString() : 
                              'Never'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No recent activity
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}