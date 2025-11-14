"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { authAPI, profileAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"
import { useLanguage } from "@/components/language-provider"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userStr = localStorage.getItem("user")
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      const role = user.role
      
      // Redirect to appropriate dashboard
      if (role === "candidate") {
        router.push("/candidate/dashboard")
      } else if (role === "recruiter") {
        router.push("/recruiter/dashboard")
      }
    } else {
      // Not logged in, show the page
      setIsChecking(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      })

      if (response.data.session) {
        localStorage.setItem("access_token", response.data.session.access_token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        
        const role = response.data.user.role
        
        // Check if profile is complete
        if (role === "candidate") {
          try {
            const profileResponse = await profileAPI.getCandidate(response.data.user.id)
            if (!profileResponse.data.candidateProfile) {
              window.location.href = "/candidate/profile/setup"
            } else {
              window.location.href = "/candidate/dashboard"
            }
          } catch (error) {
            console.log("Profile check failed, redirecting to setup")
            window.location.href = "/candidate/profile/setup"
          }
        } else {
          try {
            const profileResponse = await profileAPI.getRecruiter(response.data.user.id)
            if (!profileResponse.data.recruiterProfile) {
              window.location.href = "/recruiter/profile/setup"
            } else {
              window.location.href = "/recruiter/dashboard"
            }
          } catch (error) {
            console.log("Profile check failed, redirecting to setup")
            window.location.href = "/recruiter/profile/setup"
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything while checking auth status
  if (isChecking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-white border border-gray-200">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUserType("candidate")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === "candidate"
                    ? "bg-white text-[#633ff3] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t('auth.candidate')}
              </button>
              <button
                type="button"
                onClick={() => setUserType("recruiter")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === "recruiter"
                    ? "bg-white text-[#633ff3] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t('auth.recruiter')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{t('auth.loginTitle')}</h1>
                <p className="text-gray-600">
                  {t('auth.loginSubtitle', { type: t(`auth.${userType}`) })}
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
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
                  <Label htmlFor="password">{t('common.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
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
                  {loading ? t('auth.loggingIn') : t('common.login')}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">{t('auth.dontHaveAccount')} </span>
                  <Link
                    href="/"
                    className="font-semibold text-[#633ff3] hover:underline"
                  >
                    {t('common.signUp')}
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

