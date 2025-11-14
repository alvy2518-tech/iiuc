"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate">("candidate")
  const [isChecking, setIsChecking] = useState(true)

  // Handle email verification and redirect if already logged in
  useEffect(() => {
    const handleEmailVerification = () => {
      // Check for URL hash parameters from email verification
      const hash = window.location.hash
      if (hash.includes('access_token=') && hash.includes('type=signup')) {
        const params = new URLSearchParams(hash.substring(1)) // Remove # and parse
        const accessToken = params.get('access_token')
        const type = params.get('type')
        
        if (accessToken && type === 'signup') {
          // Store the session data
            localStorage.setItem("access_token", accessToken)
            
            // Extract user info from JWT token (basic parsing)
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
              
              // Redirect to profile setup based on role
              const role = user.role
              if (role === "candidate") {
                router.push("/candidate/profile/setup")
              } else if (role === "recruiter") {
                router.push("/recruiter/profile/setup")
              }
              return
          } catch (error) {
            console.error('Error parsing token:', error)
          }
        }
      }
    }

    // Check for email verification first
    handleEmailVerification()

    // Then check if already logged in and redirect
    const token = localStorage.getItem("access_token")
    const userStr = localStorage.getItem("user")
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      const role = user.role

      // If user just verified email, send to setup
      const fromEmailVerification = localStorage.getItem('from_email_verification') === 'true'
      if (fromEmailVerification) {
        localStorage.removeItem('from_email_verification')
        if (role === "candidate") {
          router.push("/candidate/profile/setup")
        } else if (role === "recruiter") {
          router.push("/recruiter/profile/setup")
        }
        return
      }

      // Otherwise go to dashboard
      if (role === "candidate") {
        router.push("/candidate/dashboard")
      } else if (role === "recruiter") {
        router.push("/recruiter/dashboard")
      }
      return
    }

    // Not logged in, render this page
    setIsChecking(false)
  }, [router])

  const handleContinue = () => {
    router.push(`/auth/signup?role=${selectedRole}`)
  }

  // Don't render anything while checking auth status
  if (isChecking) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3" suppressHydrationWarning>
      <main className="w-full max-w-md py-8">
        <div className="space-y-6 animate-slide-up" suppressHydrationWarning>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold leading-tight">
              {t('auth.joinAs')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.selectRole')}
            </p>
          </div>

          <div className="space-y-3">
            {/* Recruiter Option */}
            <button
              onClick={() => setSelectedRole("recruiter")}
              className={cn(
                "w-full rounded-xl glass p-4 text-left transition-all",
                selectedRole === "recruiter"
                  ? "!border-primary !bg-primary/5"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{t('auth.recruiter')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.hireAITalent')}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-colors"
                  )}
                  style={{
                    backgroundColor: selectedRole === "recruiter" ? '#633ff3' : 'transparent',
                    border: '2px solid #633ff3'
                  }}
                >
                  {selectedRole === "recruiter" && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
            </button>

            {/* Candidate Option */}
            <button
              onClick={() => setSelectedRole("candidate")}
              className={cn(
                "w-full rounded-xl glass p-4 text-left transition-all",
                selectedRole === "candidate"
                  ? "!border-primary !bg-primary/5"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{t('auth.candidate')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.findDreamJob')}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-colors"
                  )}
                  style={{
                    backgroundColor: selectedRole === "candidate" ? '#633ff3' : 'transparent',
                    border: '2px solid #633ff3'
                  }}
                >
                  {selectedRole === "candidate" && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full h-11 text-base"
            >
              {t('common.createAccount')}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t('auth.alreadyHaveAccount')} {t('common.login')}...
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
