import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import { CheckCircleIcon, XCircleIcon, QrCodeIcon } from '@heroicons/react/24/outline'

export default function VerifyCertificate() {
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { code } = router.query

  useEffect(() => {
    if (code) {
      verifyCertificate(code)
    }
  }, [code])

  const verifyCertificate = async (verificationCode) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/certificates/verify/${verificationCode}`)
      setCertificate(response.data.certificate)
    } catch (error) {
      setError(error.response?.data?.message || 'Certificate not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Certificate Verification - VolunteerHub</title>
        <meta name="description" content="Verify volunteer certificate" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Certificate Verification
            </h1>
            <p className="text-gray-600">
              Verify the authenticity of a volunteer certificate
            </p>
          </div>

          {/* Verification Result */}
          <div className="card">
            {error ? (
              <div className="text-center py-12">
                <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                >
                  Go Home
                </button>
              </div>
            ) : certificate ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Certificate Verified
                </h2>
                <p className="text-gray-600 mb-8">
                  This certificate is authentic and has been verified.
                </p>

                {/* Certificate Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Volunteer Details</h3>
                      <p className="text-gray-600">
                        <strong>Name:</strong> {certificate.volunteerName}
                      </p>
                      <p className="text-gray-600">
                        <strong>Service Days:</strong> {certificate.serviceDays}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Organization Details</h3>
                      <p className="text-gray-600">
                        <strong>NGO:</strong> {certificate.ngoName}
                      </p>
                      <p className="text-gray-600">
                        <strong>Issue Date:</strong> {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QrCodeIcon className="h-24 w-24 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/')}
                    className="btn btn-primary"
                  >
                    Verify Another Certificate
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline"
                  >
                    Print This Page
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by VolunteerHub - Connecting volunteers with NGOs</p>
          </div>
        </div>
      </div>
    </>
  )
}