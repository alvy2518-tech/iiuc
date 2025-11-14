"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, CheckCircle, XCircle, ArrowLeft, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { authAPI } from "@/lib/api"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter' | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for URL hash parameters first (Supabase email verification)
        const hash = window.location.hash
        if (hash.includes('access_token=') && hash.includes('type=signup')) {
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')
          const type = params.get('type')
          
          if (accessToken && type === 'signup') {
            // Store the session data
              localStorage.setItem("access_token", accessToken)
              
              // Extract user info from JWT token
              try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]))
                const user = {
                  id: payload.sub,
                  email: payload.email,
                  role: payload.user_metadata?.role || 'candidate',
                  fullName: payload.user_metadata?.full_name || 'User'
                }
                
                localStorage.setItem("user", JSON.stringify(user))
                
                // Set flag to indicate user is coming from email verification
                localStorage.setItem('from_email_verification', 'true')
                
                setStatus('success')
                setMessage('Email verified successfully!')
                setUserRole(user.role)
                
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                  if (user.role === 'candidate') {
                    router.push('/candidate/profile/setup')
                  } else if (user.role === 'recruiter') {
                    router.push('/recruiter/profile/setup')
                  }
                }, 2000)
                return
            } catch (error) {
              console.error('Error parsing token:', error)
              setStatus('error')
              setMessage('Invalid verification token')
              return
            }
          }
        }

        // Fallback to URL parameters (manual verification)
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        
        if (!token || type !== 'signup') {
          setStatus('verifying')
          setMessage('Please check your email and click the verification link')
          return
        }

        // Verify the email with Supabase
        const response = await authAPI.verifyEmail(token)
        
        if (response.data.user) {
          setStatus('success')
          setMessage('Email verified successfully!')
          
          // Store user data
          localStorage.setItem("access_token", response.data.session.access_token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          
          // Determine user role for redirect
          const role = response.data.user.role
          setUserRole(role)
          
          // Auto-redirect after 2 seconds
          setTimeout(() => {
            if (role === 'candidate') {
              router.push('/candidate/profile/setup')
            } else if (role === 'recruiter') {
              router.push('/recruiter/profile/setup')
            }
          }, 2000)
        }
      } catch (error: any) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verification failed')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8" suppressHydrationWarning>
      {/* Back Button - Top Left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Refresh Button - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Refresh"
        >
          <RotateCw className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      <main className="w-full max-w-md">
        <Card className="p-6 sm:p-8 bg-white border border-gray-200 shadow-lg">
          <div className="space-y-6 text-center">
            {status === 'verifying' && (
              <>
                {/* Email Icon */}
                <div className="mx-auto w-20 h-20 bg-[#633ff3]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-[#633ff3]" />
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {message || "Please check your email and click the verification link"}
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5 text-left">
                  <p className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Next Steps:</p>
                  <ol className="space-y-2 text-sm sm:text-base text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 font-medium">1.</span>
                      <span>Check your email inbox (and spam folder)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-medium">2.</span>
                      <span>Click the verification link</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-medium">3.</span>
                      <span>Complete your profile setup</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white py-2.5"
                  >
                    Try Again
                  </Button>
                  <div className="text-center text-sm sm:text-base">
                    <span className="text-gray-600">Already verified? </span>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="font-semibold text-[#633ff3] hover:text-[#5330d4] hover:underline"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                {/* Success Icon */}
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">Email Verified!</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {message}
                  </p>
                </div>

                {/* Redirect Message */}
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-gray-600">
                    Redirecting to profile setup...
                  </p>
                  <Button
                    onClick={() => {
                      if (userRole === 'candidate') {
                        router.push('/candidate/profile/setup')
                      } else if (userRole === 'recruiter') {
                        router.push('/recruiter/profile/setup')
                      }
                    }}
                    className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white py-2.5"
                  >
                    Continue to Profile Setup
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                {/* Error Icon */}
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">Verification Failed</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white py-2.5"
                  >
                    Try Signing Up Again
                  </Button>
                  <div className="text-center text-sm sm:text-base">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link
                      href="/auth/login"
                      className="font-semibold text-[#633ff3] hover:text-[#5330d4] hover:underline"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
