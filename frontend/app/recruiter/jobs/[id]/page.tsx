"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { jobsAPI, applicationsAPI } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { MapPin, Briefcase, Clock, Building2, DollarSign, Calendar, Edit, ChevronRight, Users, Loader2 } from "lucide-react"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"

interface Job {
  id: string
  job_title: string
  department: string
  job_type: string
  work_mode: string
  experience_level: string
  country: string
  city: string
  address?: string
  job_description: string
  responsibilities: string
  qualifications: string
  nice_to_have?: string
  benefits?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  salary_period?: string
  status: string
  created_at: string
  application_count?: number
  job_skills: Array<{ skill_name: string }>
}

interface Application {
  id: string
  job_id: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  applied_at: string
  candidate_profiles: {
    id: string
    headline?: string
    current_job_title?: string
    current_company?: string
    years_of_experience?: string
    profiles: {
      full_name: string
      email: string
      profile_picture_url?: string
    }
  }
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [error, setError] = useState("")
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  })
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' | 'all'>('all')

  useEffect(() => {
    loadJob()
    loadApplications()
  }, [params.id])

  const loadJob = async () => {
    try {
      const response = await jobsAPI.getById(params.id as string)
      const jobData = response.data.job || response.data
      setJob(jobData)
    } catch (err: any) {
      console.error("Error loading job:", err)
      setError(err.response?.data?.message || "Failed to load job")
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async (status?: string) => {
    setLoadingApplications(true)
    try {
      const response = await applicationsAPI.getJobApplications(params.id as string, { status })
      const applicationsData = response.data.applications || []
      setApplications(applicationsData)
      
      // Calculate stats
      const stats = {
        total: response.data.pagination?.total || 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        hired: 0
      }
      
      // If we have all applications, calculate stats from the data
      if (!status) {
        applicationsData.forEach((app: Application) => {
          stats[app.status]++
        })
      } else {
        // If filtered by status, we need to make another call to get total counts
        try {
          const allResponse = await applicationsAPI.getJobApplications(params.id as string)
          stats.total = allResponse.data.pagination?.total || 0
          
          allResponse.data.applications.forEach((app: Application) => {
            stats[app.status]++
          })
        } catch (err) {
          console.error("Error loading all applications for stats:", err)
        }
      }
      
      setApplicationStats(stats)
    } catch (err: any) {
      console.error("Error loading applications:", err)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleTabChange = (tab: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' | 'all') => {
    setActiveTab(tab)
    if (tab === 'all') {
      loadApplications()
    } else {
      loadApplications(tab)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired') => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus)
      
      // Update the application in the local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))
      
      // Update stats
      const oldStatus = applications.find(app => app.id === applicationId)?.status
      if (oldStatus && oldStatus !== newStatus) {
        setApplicationStats(prev => ({
          ...prev,
          [oldStatus]: Math.max(0, prev[oldStatus] - 1),
          [newStatus]: prev[newStatus] + 1
        }))
      }
    } catch (err) {
      console.error("Error updating application status:", err)
    }
  }

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return null
    const currency = job.salary_currency || 'JPY'
    const isAnnual = job.salary_period === 'per year' || !job.salary_period
    
    if (job.salary_min && job.salary_max) {
      if (isAnnual) {
        const min = Math.round(job.salary_min / 1000)
        const max = Math.round(job.salary_max / 1000)
        return `${currency}${min}-${max}K`
      } else {
        const period = job.salary_period === 'per month' ? '/mo' : job.salary_period === 'per hour' ? '/hr' : ''
        return `${currency}${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}${period}`
      }
    } else if (job.salary_min) {
      if (isAnnual) {
        const min = Math.round(job.salary_min / 1000)
        return `${currency}${min}K+`
      } else {
        const period = job.salary_period === 'per month' ? '/mo' : job.salary_period === 'per hour' ? '/hr' : ''
        return `${currency}${job.salary_min.toLocaleString()}${period}+`
      }
    } else {
      if (isAnnual) {
        const max = Math.round(job.salary_max! / 1000)
        return `Up to ${currency}${max}K`
      } else {
        const period = job.salary_period === 'per month' ? '/mo' : job.salary_period === 'per hour' ? '/hr' : ''
        return `Up to ${currency}${job.salary_max!.toLocaleString()}${period}`
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-amber-100 text-amber-700'
      case 'closed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
              <div className="text-center text-gray-500">Loading job details...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-10">
              <Card className="p-8 text-center bg-white border border-gray-200">
                <p className="text-red-600 mb-4">{error || "Job not found"}</p>
                <Button 
                  onClick={() => router.push("/recruiter/jobs")}
                  className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                >
                  Back to Jobs
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
          {/* Left Sidebar - Navigation */}
          <RecruiterSidebar />

          {/* Main Content */}
          <div className="lg:col-span-10">
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/recruiter/jobs")}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  ← Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
              </div>

              {/* Job Header Card */}
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-gray-900">{job.job_title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    
                    {job.department && (
                      <p className="text-sm text-gray-600 mb-4">{job.department}</p>
                    )}

                    {/* Job Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{job.job_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{job.work_mode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span>{job.experience_level}</span>
                      </div>
                      {formatSalary() && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatSalary()}</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{job.city}, {job.country}</span>
                      {job.address && <span className="text-gray-400">• {job.address}</span>}
                    </div>

                    {/* Skills */}
                    {job.job_skills && job.job_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.job_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-[#633ff3]/10 text-[#633ff3] text-xs font-medium"
                          >
                            {skill.skill_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/recruiter/jobs/${job.id}/edit`}>
                      <Button className="bg-[#633ff3] hover:bg-[#5330d4] text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Job Description Section */}
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {job.job_description}
                </div>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </Card>
              )}

              {/* Qualifications */}
              {job.qualifications && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.qualifications}
                  </div>
                </Card>
              )}

              {/* Nice to Have */}
              {job.nice_to_have && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nice to Have</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.nice_to_have}
                  </div>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </Card>
              )}

              {/* Applications Section */}
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Applications ({applicationStats.total})
                  </h3>
                  
                  {/* Filter Tabs */}
                  <div className="flex flex-wrap gap-2">
                      {(['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          activeTab === tab
                            ? 'bg-[#633ff3] text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab !== 'all' && ` (${applicationStats[tab]})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applications List */}
                {loadingApplications ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 mb-4">No applications found</p>
                    {activeTab !== 'all' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleTabChange('all')}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        View All Applications
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <Card key={application.id} className="p-4 bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {application.candidate_profiles.profiles.profile_picture_url ? (
                                <img 
                                  src={application.candidate_profiles.profiles.profile_picture_url} 
                                  alt={application.candidate_profiles.profiles.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold text-gray-600">
                                  {application.candidate_profiles.profiles.full_name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {application.candidate_profiles.profiles.full_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {application.candidate_profiles.headline || 
                                 application.candidate_profiles.current_job_title || 
                                 application.candidate_profiles.profiles.email}
                              </p>
                              {application.candidate_profiles.current_company && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {application.candidate_profiles.current_company}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <select 
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(
                                application.id, 
                                e.target.value as 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
                              )}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#633ff3] focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                            
                            <Link href={`/recruiter/applications/${application.id}`}>
                              <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
