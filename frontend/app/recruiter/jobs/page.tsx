"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { jobsAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Plus, Edit, Users } from "lucide-react"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { useLanguage } from "@/components/language-provider"

export default function RecruiterJobsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'closed'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Filter jobs client-side based on search query
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return job.job_title?.toLowerCase().includes(query) || 
             job.city?.toLowerCase().includes(query) ||
             job.country?.toLowerCase().includes(query)
    }
    return true
  })

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    fetchJobs()
  }, [activeTab])


  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError(t('recruiter.notLoggedIn'))
        router.push('/auth/login')
        return
      }
      
      // Map frontend tabs to backend status values
      let status: string | undefined = undefined
      if (activeTab === 'active') {
        status = 'active'
      } else if (activeTab === 'paused') {
        status = 'draft' // Map 'paused' to 'draft' for backend
      } else if (activeTab === 'closed') {
        status = 'closed'
      }
      // activeTab === 'all' means status stays undefined
      
      const response = await jobsAPI.getRecruiterJobs({ status })
      setJobs(response.data.jobs || [])
      setStats(response.data.stats || { total: 0, active: 0, draft: 0, closed: 0 })
    } catch (error: any) {
      console.error("Failed to fetch jobs:", error)
      // Check if it's a 403 Forbidden error
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.message || t('recruiter.accessDenied')
        setError(errorMsg)
        console.error("Authorization error:", errorMsg)
      } else if (error.response?.status === 401) {
        setError(t('recruiter.sessionExpired'))
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        router.push('/auth/login')
      } else {
        setError(t('recruiter.failedToLoadJobs'))
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
      case 'paused':
        return 'bg-amber-100 text-amber-700'
      case 'closed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return t('recruiter.draft')
      case 'active':
        return t('recruiter.active')
      case 'closed':
        return t('recruiter.closed')
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Sidebar - Navigation */}
          <RecruiterSidebar />

          {/* Main Content */}
          <div className="lg:col-span-10">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('recruiter.myJobListings')}</h1>
              <Button
                onClick={() => router.push("/recruiter/jobs/new")}
                  className="bg-[#633ff3] hover:bg-[#5330d4] text-white text-sm sm:text-base"
              >
                {t('recruiter.postNewJob')}
              </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t('recruiter.searchByJobTitle')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#633ff3]/20"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                          </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#633ff3] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('recruiter.all')}
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'active'
                        ? 'bg-[#633ff3] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('recruiter.active')}
                  </button>
                  <button
                    onClick={() => setActiveTab('paused')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'paused'
                        ? 'bg-[#633ff3] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('recruiter.draft')}
                  </button>
                  <button
                    onClick={() => setActiveTab('closed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'closed'
                        ? 'bg-[#633ff3] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t('recruiter.closed')}
                  </button>
                        </div>
                      </div>
                      
              {/* Jobs - Desktop Table */}
              <Card className="bg-white border border-gray-200 overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <input type="checkbox" className="rounded border-gray-300 text-[#633ff3] focus:ring-[#633ff3]" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('recruiter.jobTitle')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('recruiter.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('recruiter.datePosted')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('recruiter.applicants')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('recruiter.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                            {t('recruiter.loadingJobs')}
                          </td>
                        </tr>
                      ) : filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                            {searchQuery.trim() ? t('recruiter.noJobsMatchSearch') : t('recruiter.noJobsFound')}
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map((job) => (
                          <tr 
                            key={job.id} 
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="rounded border-gray-300 text-[#633ff3] focus:ring-[#633ff3]" />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{job.job_title}</div>
                              <div className="text-sm text-gray-500">{job.city}, {job.country}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                {getStatusLabel(job.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(job.created_at)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{job.application_count || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/recruiter/jobs/${job.id}/edit`)
                                  }}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#633ff3] transition-colors cursor-pointer"
                                  title={t('recruiter.editJob')}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/recruiter/applications?jobId=${job.id}`)
                                  }}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#633ff3] transition-colors cursor-pointer"
                                  title={t('recruiter.seeApplications')}
                                >
                                  <Users className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                    </div>
                    
                {/* Pagination */}
                <div className="bg-white px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-[#633ff3] text-white text-sm font-medium cursor-pointer">1</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer">2</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer">3</button>
                  <span className="px-2 text-gray-400">...</span>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer">8</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer">9</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer">10</button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                    </div>
                  </div>
                </Card>

              {/* Jobs - Mobile Cards */}
              <div className="md:hidden space-y-3">
                {loading ? (
                  <Card className="p-4 text-center bg-white border border-gray-200 text-sm text-gray-500">
                    {t('recruiter.loadingJobs')}
                  </Card>
                ) : filteredJobs.length === 0 ? (
                  <Card className="p-4 text-center bg-white border border-gray-200 text-sm text-gray-500">
                    {searchQuery.trim() ? t('recruiter.noJobsMatchSearch') : t('recruiter.noJobsFound')}
                  </Card>
                ) : (
                  filteredJobs.map((job) => (
                    <Card key={job.id} className="p-4 bg-white border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 leading-tight">{job.job_title}</h3>
                          <p className="text-xs text-gray-600 mt-0.5">{job.city}, {job.country}</p>
                        </div>
                        <span className={`px-2 py-0.5 inline-flex text-[11px] leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-500">{t('recruiter.datePosted')}</p>
                          <p className="font-medium text-gray-900">{formatDate(job.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">{t('recruiter.applicants')}</p>
                          <p className="font-medium text-gray-900">{job.application_count || 0}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => router.push(`/recruiter/applications?jobId=${job.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#633ff3]/10 text-[#633ff3] text-xs font-medium cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5" /> {t('recruiter.seeApplications')}
                        </button>
                        <button
                          onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" /> {t('recruiter.editJob')}
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}