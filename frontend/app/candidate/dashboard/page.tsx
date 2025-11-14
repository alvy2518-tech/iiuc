"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Briefcase, Bell, User, ArrowRight, FileText, Clock, Award, Bookmark, List, FolderOpen, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { savedJobsAPI, applicationsAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { CommonNavbar } from "@/components/common-navbar"
import { useLanguage } from "@/components/language-provider"

export default function CandidateDashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [totalSavedJobs, setTotalSavedJobs] = useState(0)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
    }
    
    fetchData()

    // Set up polling every 30 seconds for realtime updates
    const pollInterval = setInterval(() => {
      fetchData()
    }, 30000) // 30 seconds

    // Refetch when window gets focus
    const handleFocus = () => {
      fetchData()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      }
      
      // Fetch saved jobs
      const jobsResponse = await savedJobsAPI.getSavedJobs()
      const savedJobsList = jobsResponse.data.savedJobs || []
      // Store total count for stats
      setTotalSavedJobs(savedJobsList.length)
      // Extract job data from saved jobs response (show only top 3 in sidebar)
      setSavedJobs(savedJobsList.slice(0, 3).map((item: any) => item.jobs))
      
      // Fetch applications (only if user is logged in)
      try {
        const appsResponse = await applicationsAPI.getCandidateApplications()
        console.log('Applications response:', appsResponse.data)
        setApplications(appsResponse.data.applications || [])
      } catch (appError: any) {
        // Handle 401 error gracefully - user not logged in
        if (appError.response?.status === 401) {
          console.log("Not authenticated, showing empty applications")
          setApplications([])
        } else {
          console.error("Failed to fetch applications:", appError)
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
      if (isManualRefresh) {
        setRefreshing(false)
      }
    }
  }

  const handleManualRefresh = () => {
    fetchData(true)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interviewing':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'viewed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'submitted':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Common Navbar */}
      <CommonNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.welcome')}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('dashboard.activitySummary')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-600 mt-1">{t('dashboard.applicationsSubmitted')}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {applications.filter((app: any) => app.status?.toLowerCase() === 'interviewing').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{t('dashboard.inProgress')}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600 mt-1">{t('dashboard.offersReceived')}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-sky-50 text-sky-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{totalSavedJobs}</div>
                  <div className="text-sm text-gray-600 mt-1">{t('common.jobs')}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Application Status */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-white border border-gray-200">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <List className="h-5 w-5 text-gray-700" />
                  {t('dashboard.applicationStatus')}
                </h2>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('dashboard.searchApplications')}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#633ff3] focus:border-transparent"
                  />
            </div>

                {/* Applications Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">{t('dashboard.jobTitle')}</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">{t('common.company')}</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">{t('dashboard.dateApplied')}</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">{t('jobs.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
            {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-sm text-gray-500">
                            {t('dashboard.loadingApplications')}
                          </td>
                        </tr>
                      ) : applications.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-sm text-gray-500">
                            {t('dashboard.noApplications')}
                          </td>
                        </tr>
                      ) : (
                        applications.map((app: any) => (
                          <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">{app.jobs?.job_title || 'N/A'}</td>
                            <td className="py-3 px-2 text-sm text-gray-600">{app.jobs?.recruiter_profiles?.company_name || 'N/A'}</td>
                            <td className="py-3 px-2 text-sm text-gray-600">{formatDate(app.applied_at)}</td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                                {app.status || 'Submitted'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
              </div>
              </Card>
            </div>

            {/* Right Column - Saved Jobs & Portfolio */}
            <div className="space-y-6">
              {/* Saved Jobs */}
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Bookmark className="h-5 w-5 text-gray-700" />
                    {t('dashboard.savedJobs')}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/candidate/saved-jobs')}
                    className="text-[#633ff3] hover:text-[#5330d4]"
                  >
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                {loading ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {t('common.loading')}
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    {t('dashboard.noJobs')}
                  </div>
            ) : (
              <div className="space-y-3">
                    {savedJobs.map((job: any) => (
                      <div key={job.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <h3 className="text-sm font-semibold text-gray-900">{job.job_title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{job.recruiter_profiles?.company_name}</p>
                        <Button 
                          size="sm" 
                          className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                  >
                          {t('jobs.applyNow')}
                        </Button>
                      </div>
                          ))}
                        </div>
                      )}
              </Card>

              {/* Portfolio */}
              <Card className="p-6 bg-white border border-gray-200">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <FolderOpen className="h-5 w-5 text-gray-700" />
                  Your Portfolio
                </h2>
                
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center mb-3">
                    <Briefcase className="h-10 w-10 text-amber-600" />
                  </div>
                  <Button 
                    className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white"
                    onClick={() => router.push('/candidate/profile/edit')}
                  >
                    Edit Portfolio
                  </Button>
                    </div>
                  </Card>
              </div>
          </div>
        </div>
      </main>
      </div>
  )
}

