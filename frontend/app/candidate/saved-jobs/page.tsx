"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, MapPin, Briefcase, DollarSign, X, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"

export default function SavedJobsPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedJobs()

    // Refetch when window gets focus (user comes back to tab/page)
    const handleFocus = () => {
      fetchSavedJobs()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const response = await savedJobsAPI.getSavedJobs()
      console.log('Saved jobs API response:', response.data)
      console.log('Saved jobs count:', response.data.savedJobs?.length)
      setSavedJobs(response.data.savedJobs || [])
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      await savedJobsAPI.removeSavedJob(jobId)
      setSavedJobs(savedJobs.filter(item => item.jobs.id !== jobId))
    } catch (error) {
      console.error("Failed to remove saved job:", error)
    }
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return "Salary not specified"
    const formatter = new Intl.NumberFormat('en-US')
    if (min && max) {
      return `${currency} ${formatter.format(min)} - ${formatter.format(max)}`
    }
    if (min) return `${currency} ${formatter.format(min)}+`
    if (max) return `Up to ${currency} ${formatter.format(max)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <CommonNavbar />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-sm text-gray-600 mt-1">
              Jobs you've bookmarked for later review
            </p>
          </div>

          {/* Saved Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#633ff3] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">Loading saved jobs...</p>
            </div>
          ) : savedJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Jobs</h3>
              <p className="text-sm text-gray-600 mb-6">
                Start exploring jobs and save the ones you're interested in
              </p>
              <Button
                onClick={() => router.push('/candidate/jobs')}
                className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
              >
                Browse Jobs
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedJobs.map((item: any) => {
                const job = item.jobs
                return (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Job Title and Company */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 
                              className="text-xl font-bold text-gray-900 hover:text-[#633ff3] cursor-pointer"
                              onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                            >
                              {job.job_title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {job.recruiter_profiles?.company_name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSavedJob(job.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.city}, {job.country}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.job_type}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">{job.work_mode}</Badge>
                          <Badge variant="secondary">{job.experience_level}</Badge>
                          {job.department && <Badge variant="outline">{job.department}</Badge>}
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {job.job_description}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                            className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Summary */}
          {!loading && savedJobs.length > 0 && (
            <div className="text-center text-sm text-gray-600">
              Showing {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

