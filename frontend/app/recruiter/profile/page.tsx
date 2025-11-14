"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, MapPin, Globe, Edit } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { profileAPI } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export default function RecruiterProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState<any>(null)
  const [recruiterData, setRecruiterData] = useState<any>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.push("/auth/login")
        return
      }
      
      const user = JSON.parse(userStr)
      const response = await profileAPI.getRecruiter(user.id)
      
      setProfileData(response.data.profile || {})
      setRecruiterData(response.data.recruiterProfile || {})
    } catch (err: any) {
      console.error("Failed to fetch profile:", err)
      setError(err.response?.data?.message || t('recruiter.failedToLoadProfile'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-10">
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">{t('recruiter.loadingProfile')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-10">
              <Card className="p-6 bg-white border border-gray-200">
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => router.push("/recruiter/profile/setup")}
                  className="bg-[#633ff3] hover:bg-[#5330d4] text-white cursor-pointer"
                >
                  {t('recruiter.setupProfile')}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <RecruiterSidebar />

          <div className="lg:col-span-10">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('recruiter.profile')}</h1>
                <Button
                  onClick={() => router.push("/recruiter/profile/setup")}
                  className="bg-[#633ff3] hover:bg-[#5330d4] text-white cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('recruiter.editProfile')}
                </Button>
              </div>

              {/* Personal Information */}
              <Card className="p-6 bg-white border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.personalInformation')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('profile.fullName')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {profileData?.full_name || t('recruiter.notProvided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('profile.phoneNumber')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {profileData?.phone_number || t('recruiter.notProvided')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Company Information */}
              <Card className="p-6 bg-white border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#633ff3]" />
                  {t('recruiter.companyInformation')}
                </h2>
                <div className="space-y-4">
                  {recruiterData?.company_logo_url && (
                    <div className="mb-4">
                      <img 
                        src={recruiterData.company_logo_url} 
                        alt={recruiterData.company_name || "Company logo"}
                        className="h-20 w-20 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('recruiter.companyName')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {recruiterData?.company_name || t('recruiter.notProvided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('recruiter.companySize')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {recruiterData?.company_size || t('recruiter.notProvided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('recruiter.industry')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {recruiterData?.industry || t('recruiter.notProvided')}
                      </p>
                    </div>
                    {recruiterData?.company_website && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {t('recruiter.website')}
                        </p>
                        <a 
                          href={recruiterData.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-[#633ff3] hover:underline"
                        >
                          {recruiterData.company_website}
                        </a>
                      </div>
                    )}
                  </div>

                  {recruiterData?.company_description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('recruiter.companyDescription')}</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {recruiterData.company_description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Location */}
              <Card className="p-6 bg-white border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#633ff3]" />
                  {t('recruiter.location')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('profile.country')}</p>
                    <p className="text-base font-medium text-gray-900">
                      {recruiterData?.country || t('recruiter.notProvided')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('profile.city')}</p>
                    <p className="text-base font-medium text-gray-900">
                      {recruiterData?.city || t('recruiter.notProvided')}
                    </p>
                  </div>
                  {recruiterData?.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">{t('recruiter.address')}</p>
                      <p className="text-base font-medium text-gray-900">
                        {recruiterData.address}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

