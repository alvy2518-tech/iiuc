"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { jobsAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { useLanguage } from "@/components/language-provider"

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [jobs, setJobs] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])


  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getRecruiterJobs({ limit: 5 })
      setJobs(response.data.jobs || [])
      setStats(response.data.stats || { total: 0, active: 0, draft: 0 })
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
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
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="p-3 sm:p-4 bg-white border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{t('dashboard.totalJobs')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </Card>
                <Card className="p-3 sm:p-4 bg-white border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{t('dashboard.activeJobs')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.active}</p>
            </Card>
                <Card className="p-3 sm:p-4 bg-white border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{t('dashboard.draft')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.draft}</p>
            </Card>
          </div>

              {/* Job Postings Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.yourJobPostings')}</h2>
          <Button
            onClick={() => router.push("/recruiter/jobs/new")}
                    className="bg-[#633ff3] hover:bg-[#5330d4] text-white text-sm sm:text-base"
          >
                    {t('dashboard.postNewJob')}
          </Button>
                </div>

                {/* Jobs Table */}
                <Card className="bg-white border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('dashboard.jobTitle')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('common.location')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('dashboard.applicants')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('dashboard.datePosted')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                              {t('dashboard.loadingJobs')}
                            </td>
                          </tr>
                        ) : jobs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                              {t('dashboard.noJobsYet')}
                            </td>
                          </tr>
                        ) : (
                          jobs.map((job) => (
                            <tr 
                              key={job.id} 
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/recruiter/applications?jobId=${job.id}`)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{job.job_title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">{job.city}, {job.country}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">{job.application_count || 0}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">{formatDate(job.created_at)}</div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
            </div>

        </div>
      </div>
    </div>
  )
}

