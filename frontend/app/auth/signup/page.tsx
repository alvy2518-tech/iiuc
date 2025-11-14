"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { authAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<"recruiter" | "candidate">("candidate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("access_token")
    const userStr = localStorage.getItem("user")
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      const userRole = user.role
      
      // Redirect to appropriate dashboard
      if (userRole === "candidate") {
        router.push("/candidate/dashboard")
      } else if (userRole === "recruiter") {
        router.push("/recruiter/dashboard")
      }
      return
    }
    
    // Set role from URL parameter
    const roleParam = searchParams.get("role")
    if (roleParam === "recruiter" || roleParam === "candidate") {
      setRole(roleParam)
    }
    
    // Not logged in, show the page
    setIsChecking(false)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: role,
      })

      // Redirect to verification page
      router.push('/auth/verify')
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything while checking auth status
  if (isChecking) {
    return null
  }

  // Show verification message if signup was successful
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <CommonNavbar />
        
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 bg-white border border-gray-200">
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <div className="mx-auto w-16 h-16 bg-[#633ff3]/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#633ff3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
                  <p className="text-sm text-gray-600">
                    We've sent a verification link to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-sm">
                    <p className="font-medium mb-2 text-gray-900">Next Steps:</p>
                    <ol className="space-y-1 text-gray-600">
                      <li>1. Check your email inbox (and spam folder)</li>
                      <li>2. Click the verification link</li>
                      <li>3. Complete your profile setup</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowVerificationMessage(false)}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Try Again
                    </Button>
                    
                    <div className="text-center text-sm">
                      <span className="text-gray-600">Already verified? </span>
                      <Link
                        href="/auth/login"
                        className="font-semibold text-[#633ff3] hover:underline"
                      >
                        Log In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <CommonNavbar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-white border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Create your {role === "candidate" ? "Job Seeker" : "Recruiter"} account
                </h1>
                <p className="text-gray-600">
                  Start your journey with JobPortal
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="border-gray-300 focus:border-[#633ff3] focus:ring-[#633ff3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-gray-300 focus:border-[#633ff3] focus:ring-[#633ff3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="border-gray-300 focus:border-[#633ff3] focus:ring-[#633ff3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="border-gray-300 focus:border-[#633ff3] focus:ring-[#633ff3]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#633ff3] hover:bg-[#5330d4] text-white"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#633ff3] hover:underline"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

