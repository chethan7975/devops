'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardData {
  volunteer: {
    name: string;
    email: string;
    serviceDays: number;
    isApproved: boolean;
    lastServiceDate?: string;
    hasCheckedInToday: boolean;
  };
  ngo: {
    name: string;
    logo?: string;
    certificateThreshold: number;
  };
  certificates: any[];
  canGetCertificate: boolean;
  recentServices: any[];
  stats: {
    totalServices: number;
    thisMonth: number;
    daysUntilCertificate: number;
  };
}

export default function VolunteerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'volunteer') {
      router.push('/login');
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/volunteer/dashboard');
      setDashboardData(response.data.data);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      await api.post('/volunteer/checkin');
      toast.success('Daily service marked successfully!');
      loadDashboardData(); // Reload data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
    } finally {
      setIsCheckingIn(false);
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

  const { volunteer, ngo, certificates, canGetCertificate, stats } = dashboardData;
  const progressPercentage = Math.min((volunteer.serviceDays / ngo.certificateThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {volunteer.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Volunteering with <span className="font-semibold text-blue-600">{ngo.name}</span>
          </p>
        </div>

        {/* Approval Status */}
        {!volunteer.isApproved && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Pending Approval
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your account is waiting for approval from {ngo.name}. You'll be able to log service hours once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Service Days</p>
                <p className="text-2xl font-bold text-gray-900">{volunteer.serviceDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Days to Certificate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.daysUntilCertificate > 0 ? stats.daysUntilCertificate : '🎉'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Check-in Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Daily Check-in
                </h2>
                
                {volunteer.hasCheckedInToday ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Great job! You've already checked in today.
                    </h3>
                    <p className="text-gray-600">
                      Come back tomorrow to log another day of service.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to serve today?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Click the button below to mark your volunteer service for today.
                    </p>
                    <button
                      onClick={handleCheckIn}
                      disabled={!volunteer.isApproved || isCheckingIn}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingIn ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Checking in...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Mark Service Today
                        </>
                      )}
                    </button>
                    {!volunteer.isApproved && (
                      <p className="mt-3 text-sm text-red-600">
                        You need to be approved by the NGO before you can check in.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Certificate Progress
                  </h2>
                  <span className="text-sm text-gray-500">
                    {volunteer.serviceDays} / {ngo.certificateThreshold} days
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {canGetCertificate ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrophyIcon className="h-5 w-5 text-green-400 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">
                          Congratulations! 🎉
                        </h3>
                        <p className="mt-1 text-sm text-green-700">
                          You've reached the required service days. Your NGO can now issue your certificate!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Keep up the great work! You need {stats.daysUntilCertificate} more days to earn your certificate.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificates */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    My Certificates
                  </h2>
                  <button
                    onClick={() => router.push('/volunteer/certificates')}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View all
                  </button>
                </div>

                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.slice(0, 3).map((cert, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <DocumentArrowDownIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Certificate #{cert.certificateId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {cert.serviceDays} days • {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <DocumentArrowDownIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No certificates yet. Keep volunteering to earn your first certificate!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* NGO Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Your NGO
                </h2>
                <div className="text-center">
                  {ngo.logo ? (
                    <img
                      src={ngo.logo}
                      alt={ngo.name}
                      className="h-16 w-16 rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {ngo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900">{ngo.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Certificate after {ngo.certificateThreshold} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}