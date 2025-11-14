"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Briefcase, DollarSign, X, ExternalLink, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"

export default function InterestedJobsPage() {
  const router = useRouter()
  const [interestedJobs, setInterestedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterestedJobs()

    // Refetch when window gets focus
    const handleFocus = () => {
      fetchInterestedJobs()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchInterestedJobs = async () => {
    try {
      setLoading(true)
      const response = await savedJobsAPI.getInterestedJobs()
      console.log('Interested jobs API response:', response.data)
      console.log('Interested jobs count:', response.data.interestedJobs?.length)
      setInterestedJobs(response.data.interestedJobs || [])
    } catch (error) {
      console.error("Failed to fetch interested jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveInterestedJob = async (jobId: string) => {
    try {
      await savedJobsAPI.removeInterestedJob(jobId)
      setInterestedJobs(interestedJobs.filter(item => item.jobs.id !== jobId))
    } catch (error) {
      console.error("Failed to remove interested job:", error)
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interested Jobs</h1>
              <p className="text-sm text-gray-600 mt-1">
                Career opportunities you're actively pursuing
              </p>
            </div>
            {interestedJobs.length > 0 && (
              <Button
                onClick={() => router.push('/candidate/roadmap')}
                className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Learning Roadmap
              </Button>
            )}
          </div>

          {/* Info Card */}
          {interestedJobs.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">AI-Powered Career Planning</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    We analyze all your interested jobs together to create a personalized learning roadmap. 
                    Click "View Learning Roadmap" to see your path to these opportunities.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Interested Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#633ff3] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">Loading interested jobs...</p>
            </div>
          ) : interestedJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interested Jobs Yet</h3>
              <p className="text-sm text-gray-600 mb-6">
                Mark jobs as "interested" to get AI-powered learning roadmaps that help you prepare for multiple career paths
              </p>
              <Button
                onClick={() => router.push('/candidate/jobs')}
                className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
              >
                Explore Jobs
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {interestedJobs.map((item: any) => {
                const job = item.jobs
                return (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-[#633ff3]">
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
                            onClick={() => handleRemoveInterestedJob(job.id)}
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
          {!loading && interestedJobs.length > 0 && (
            <div className="text-center text-sm text-gray-600">
              Showing {interestedJobs.length} interested {interestedJobs.length === 1 ? 'job' : 'jobs'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

