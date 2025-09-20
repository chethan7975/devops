'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { NGO } from '@/types';

interface VolunteerFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  ngoId: string;
}

interface NGOFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  description: string;
  certificateThreshold: number;
  contactInfo: {
    phone: string;
    address: string;
    website: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'volunteer' | 'ngo'>('volunteer');
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNGOs, setIsLoadingNGOs] = useState(false);

  // Set role from URL params if present
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'volunteer' || roleParam === 'ngo') {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Load NGOs for volunteer registration
  useEffect(() => {
    if (selectedRole === 'volunteer') {
      loadNGOs();
    }
  }, [selectedRole]);

  const loadNGOs = async () => {
    try {
      setIsLoadingNGOs(true);
      const response = await api.get('/volunteer/ngos');
      setNgos(response.data.data);
    } catch (error) {
      console.error('Error loading NGOs:', error);
      toast.error('Failed to load NGOs');
    } finally {
      setIsLoadingNGOs(false);
    }
  };

  const volunteerForm = useForm<VolunteerFormData>();
  const ngoForm = useForm<NGOFormData>({
    defaultValues: {
      certificateThreshold: 30,
      contactInfo: {
        phone: '',
        address: '',
        website: '',
      },
    },
  });

  const onSubmitVolunteer = async (data: VolunteerFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/register/volunteer', {
        name: data.name,
        email: data.email,
        password: data.password,
        ngoId: data.ngoId,
      });

      toast.success('Registration successful! Please wait for NGO approval.');
      router.push('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitNGO = async (data: NGOFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/register/ngo', {
        name: data.name,
        email: data.email,
        password: data.password,
        description: data.description,
        certificateThreshold: data.certificateThreshold,
        contactInfo: data.contactInfo,
      });

      toast.success('NGO registration successful!');
      router.push('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-base font-medium text-gray-900">
              I want to register as a:
            </label>
            <fieldset className="mt-4">
              <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="volunteer-reg"
                    value="volunteer"
                    type="radio"
                    checked={selectedRole === 'volunteer'}
                    onChange={(e) => setSelectedRole(e.target.value as 'volunteer')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="volunteer-reg" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    Volunteer
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="ngo-reg"
                    value="ngo"
                    type="radio"
                    checked={selectedRole === 'ngo'}
                    onChange={(e) => setSelectedRole(e.target.value as 'ngo')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="ngo-reg" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    NGO
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Volunteer Registration Form */}
          {selectedRole === 'volunteer' && (
            <form className="space-y-6" onSubmit={volunteerForm.handleSubmit(onSubmitVolunteer)}>
              <div>
                <label htmlFor="vol-name" className="block text-sm font-medium leading-6 text-gray-900">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    {...volunteerForm.register('name', { required: 'Name is required' })}
                    id="vol-name"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Enter your full name"
                  />
                </div>
                {volunteerForm.formState.errors.name && (
                  <p className="mt-2 text-sm text-red-600">{volunteerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vol-email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    {...volunteerForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    id="vol-email"
                    type="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Enter your email"
                  />
                </div>
                {volunteerForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600">{volunteerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vol-ngo" className="block text-sm font-medium leading-6 text-gray-900">
                  Select NGO
                </label>
                <div className="mt-2">
                  <select
                    {...volunteerForm.register('ngoId', { required: 'Please select an NGO' })}
                    id="vol-ngo"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  >
                    <option value="">Choose an NGO...</option>
                    {ngos.map((ngo) => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.name} ({ngo.certificateThreshold} days for certificate)
                      </option>
                    ))}
                  </select>
                </div>
                {volunteerForm.formState.errors.ngoId && (
                  <p className="mt-2 text-sm text-red-600">{volunteerForm.formState.errors.ngoId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vol-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    {...volunteerForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    id="vol-password"
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {volunteerForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600">{volunteerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vol-confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    {...volunteerForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                    id="vol-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {volunteerForm.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{volunteerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || isLoadingNGOs}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Register as Volunteer'
                )}
              </button>
            </form>
          )}

          {/* NGO Registration Form */}
          {selectedRole === 'ngo' && (
            <form className="space-y-6" onSubmit={ngoForm.handleSubmit(onSubmitNGO)}>
              <div>
                <label htmlFor="ngo-name" className="block text-sm font-medium leading-6 text-gray-900">
                  NGO Name
                </label>
                <div className="mt-2">
                  <input
                    {...ngoForm.register('name', { required: 'NGO name is required' })}
                    id="ngo-name"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Enter your NGO name"
                  />
                </div>
                {ngoForm.formState.errors.name && (
                  <p className="mt-2 text-sm text-red-600">{ngoForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ngo-email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    {...ngoForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    id="ngo-email"
                    type="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Enter NGO email"
                  />
                </div>
                {ngoForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600">{ngoForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ngo-description" className="block text-sm font-medium leading-6 text-gray-900">
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    {...ngoForm.register('description')}
                    id="ngo-description"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Describe your NGO's mission and activities"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ngo-threshold" className="block text-sm font-medium leading-6 text-gray-900">
                  Certificate Threshold (Days)
                </label>
                <div className="mt-2">
                  <input
                    {...ngoForm.register('certificateThreshold', {
                      required: 'Certificate threshold is required',
                      min: {
                        value: 1,
                        message: 'Threshold must be at least 1 day',
                      },
                    })}
                    id="ngo-threshold"
                    type="number"
                    min="1"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="30"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Number of service days required for volunteers to earn a certificate
                </p>
                {ngoForm.formState.errors.certificateThreshold && (
                  <p className="mt-2 text-sm text-red-600">{ngoForm.formState.errors.certificateThreshold.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ngo-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    {...ngoForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    id="ngo-password"
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {ngoForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600">{ngoForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ngo-confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    {...ngoForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                    id="ngo-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {ngoForm.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{ngoForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Register NGO'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}