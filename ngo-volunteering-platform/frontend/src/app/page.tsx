'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  HeartIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: HeartIcon,
      title: 'Easy Volunteering',
      description: 'Simple daily check-in system to track your volunteer service hours with participating NGOs.',
    },
    {
      icon: UserGroupIcon,
      title: 'NGO Management',
      description: 'Comprehensive dashboard for NGOs to manage volunteers, approve registrations, and track progress.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Digital Certificates',
      description: 'Automatically generated certificates with QR codes for verification when service goals are met.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Verified',
      description: 'Blockchain-style verification system ensures the authenticity of all volunteer certificates.',
    },
  ];

  const stats = [
    { label: 'Active Volunteers', value: '2,500+' },
    { label: 'Partner NGOs', value: '150+' },
    { label: 'Service Hours', value: '50,000+' },
    { label: 'Certificates Issued', value: '1,200+' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Empowering Communities Through
              <span className="block text-yellow-300">Volunteer Service</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with NGOs, track your volunteer hours, and earn verified certificates 
              for your community service contributions.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-700 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-blue-100 mb-4">
                  Welcome back, <span className="font-semibold text-white">{user?.name}</span>!
                </p>
                <Link
                  href={user?.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard'}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VolunteerHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform streamlines volunteer management and recognition, 
              making it easier than ever to make a difference in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start your volunteering journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Register & Get Approved
              </h3>
              <p className="text-gray-600">
                Sign up as a volunteer, choose your preferred NGO, and wait for approval from the organization.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track Your Service
              </h3>
              <p className="text-gray-600">
                Use our daily check-in system to log your volunteer hours and track your progress over time.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Earn Certificates
              </h3>
              <p className="text-gray-600">
                Receive verified digital certificates when you reach service milestones set by your NGO.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of volunteers who are already making an impact in their communities.
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?role=volunteer"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Join as Volunteer
              </Link>
              <Link
                href="/register?role=ngo"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Register NGO
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-2xl font-bold">VolunteerHub</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering communities through verified volunteer service.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="/verify" className="hover:text-white transition-colors">
                Verify Certificate
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}