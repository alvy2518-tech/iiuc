"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { applicationsAPI, jobsAPI, aiAnalysisAPI } from "@/lib/api"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Download, Mail, Phone, Globe, ArrowRight, X, Sparkles, TrendingUp, AlertCircle, Filter } from "lucide-react"

interface Application {
  id: string
  status: string
  applied_at: string
  candidate_profiles: {
    id: string
    headline?: string
    current_job_title?: string
    current_company?: string
    portfolio_website?: string
    profiles: {
      full_name: string
      email: string
      phone_number?: string
      profile_picture_url?: string
    }
  }
  ai_analysis?: {
    overall_score: number
    score_breakdown: {
      skills_match: number
      experience_match: number
      education_match: number
      overall_fit: number
    }
    strengths: string[]
    skill_gaps: string[]
    experience_gaps: string[]
    recommendations: string[]
    fit_level: string
    summary: string
  }
  analyzing?: boolean
}

interface Job {
  id: string
  job_title: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>(jobId || "")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectBestCount, setSelectBestCount] = useState<string>("5")
  const [selectedBestIds, setSelectedBestIds] = useState<Set<string>>(new Set())
  const [selectBestLoading, setSelectBestLoading] = useState(false)

  useEffect(() => {
    fetchJobs()
    if (jobId) {
      fetchApplications(jobId)
    }
  }, [])

  useEffect(() => {
    if (selectedJob) {
      fetchApplications(selectedJob)
    }
  }, [selectedJob])

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getRecruiterJobs({ limit: 100 })
      setJobs(response.data.jobs || [])
      if (!selectedJob && response.data.jobs && response.data.jobs.length > 0) {
        setSelectedJob(response.data.jobs[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }

  const fetchApplications = async (jobId: string) => {
    try {
      setLoading(true)
      const response = await applicationsAPI.getJobApplications(jobId)
      
      // Filter out shortlisted - they belong in interview page
      const filtered = (response.data.applications || []).filter(
        (app: Application) => app.status !== 'shortlisted'
      )
      
      setApplications(filtered)
      if (filtered.length > 0) {
        setSelectedApplication(filtered[0].id)
      } else {
        setSelectedApplication(null)
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeApplication = async (applicationId: string) => {
    try {
      // Set analyzing state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, analyzing: true } : app
      ))

      const response = await aiAnalysisAPI.analyzeApplicantCompatibility(applicationId)
      
      // Update application with analysis results
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, ai_analysis: response.data.analysis, analyzing: false } 
          : app
      ))
    } catch (error) {
      console.error("Failed to analyze application:", error)
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, analyzing: false } : app
      ))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-blue-50 border-blue-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus)
      
      if (newStatus === 'shortlisted') {
        setApplications(apps => apps.filter(app => app.id !== applicationId))
        if (selectedJob) {
          router.push(`/recruiter/interview?jobId=${selectedJob}`)
        }
      } else {
        setApplications(apps => 
          apps.map(app => 
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        )
      }
    } catch (error) {
      console.error("Failed to update:", error)
      alert("Failed to update status")
    }
  }

  const handleSelectBest = async () => {
    const count = parseInt(selectBestCount) || 0
    if (count <= 0) {
      alert("Please enter a valid number greater than 0")
      return
    }

    setSelectBestLoading(true)
    try {
      // Get unanalyzed applications
      const unanalyzedApps = applications.filter(app => !app.ai_analysis?.overall_score)
      
      // Auto-analyze ALL unanalyzed candidates first
      if (unanalyzedApps.length > 0) {
        try {
          // Analyze all unanalyzed candidates sequentially to avoid overwhelming the server
          for (const app of unanalyzedApps) {
            await analyzeApplication(app.id)
          }
          
          // Wait for all analyses to complete
          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch (error) {
          console.error("Error analyzing candidates:", error)
        }
      }

      // Refetch applications to get updated AI scores from the backend
      const response = await applicationsAPI.getJobApplications(selectedJob)
      const updatedApps = (response.data.applications || []).filter(
        (app: Application) => app.status !== 'shortlisted'
      )
      
      // Update local state with fresh data
      setApplications(updatedApps)

      // Get all applications with AI analysis from fresh data
      const analyzedApps = updatedApps.filter((app: Application) => app.ai_analysis?.overall_score)
      
      if (analyzedApps.length === 0) {
        alert("No candidates have been analyzed yet. Please try again.")
        return
      }

      // Sort by AI score (descending) and take top N
      const sortedByScore = [...analyzedApps].sort((a, b) => 
        (b.ai_analysis?.overall_score || 0) - (a.ai_analysis?.overall_score || 0)
      )
      
      const topCandidates = sortedByScore.slice(0, count)
      const topIds = new Set(topCandidates.map(app => app.id))
      
      setSelectedBestIds(topIds)
      
      // Automatically shortlist the top N candidates and send to interview manager
      for (const candidate of topCandidates) {
        await updateApplicationStatus(candidate.id, 'shortlisted')
      }
      
      // Set the first one as selected for preview
      if (topCandidates.length > 0) {
        setSelectedApplication(topCandidates[0].id)
      }
      
      // Navigate to interview manager
      setTimeout(() => {
        router.push(`/recruiter/interview?jobId=${selectedJob}`)
      }, 500)
    } catch (error) {
      console.error("Error in handleSelectBest:", error)
      alert("Failed to select best candidates. Please try again.")
    } finally {
      setSelectBestLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedBestIds(new Set())
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidate_profiles.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || app.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const selectedApp = applications.find(app => app.id === selectedApplication)

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RecruiterSidebar />

          <div className="lg:col-span-7">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Applicants for {jobs.find(j => j.id === selectedJob)?.job_title || "Job"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">Review and manage applications</p>
              </div>

              {/* Select Best Candidates Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="h-5 w-5 text-[#633ff3]" />
                      <h3 className="font-semibold text-gray-900">Select Best Candidates</h3>
                    </div>
                    <p className="text-sm text-gray-600">Auto-select top candidates by AI compatibility score</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="best-count" className="text-sm font-medium text-gray-700">
                        Top
                      </label>
                      <input
                        id="best-count"
                        type="number"
                        min="1"
                        value={selectBestCount}
                        onChange={(e) => setSelectBestCount(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-[#633ff3]"
                        placeholder="5"
                      />
                      <span className="text-sm font-medium text-gray-700">candidates</span>
                    </div>
                    <Button
                      onClick={handleSelectBest}
                      disabled={selectBestLoading}
                      className="bg-[#633ff3] hover:bg-[#5330d4] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectBestLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        "Select"
                      )}
                    </Button>
                    {selectedBestIds.size > 0 && (
                      <Button
                        onClick={clearSelection}
                        variant="outline"
                        className="text-gray-700 border-gray-300"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                {selectBestLoading && (
                  <div className="mt-3 p-3 bg-[#633ff3]/5 rounded border border-[#633ff3]/20">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-[#633ff3] border-t-transparent rounded-full"></div>
                      <span>Analyzing candidates...</span>
                    </p>
                  </div>
                )}
                {selectedBestIds.size > 0 && !selectBestLoading && (
                  <div className="mt-3 p-3 bg-[#633ff3]/5 rounded border border-[#633ff3]/20">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#633ff3]">{selectedBestIds.size}</span>
                      <span className="text-gray-600"> top candidate(s) selected. Highlighted below.</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border"
                >
                  <option value="All">All</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>

              <Card className="bg-white border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        APPLICANT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        AI SCORE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        APPLIED
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No applications found
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr 
                          key={app.id} 
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedBestIds.has(app.id) 
                              ? 'bg-[#633ff3]/10 border-l-4 border-l-[#633ff3] hover:bg-[#633ff3]/10' 
                              : selectedApplication === app.id 
                              ? 'bg-purple-50' 
                              : ''
                          }`}
                          onClick={() => setSelectedApplication(app.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {app.candidate_profiles.profiles.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {app.candidate_profiles.current_job_title || app.candidate_profiles.headline || "Candidate"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.analyzing ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-[#633ff3] border-t-transparent rounded-full"></div>
                                <span className="text-xs text-gray-500">Analyzing...</span>
                              </div>
                            ) : app.ai_analysis ? (
                              <div className="flex items-center gap-2">
                                <div className={`text-lg font-bold ${getScoreColor(app.ai_analysis.overall_score)}`}>
                                  {app.ai_analysis.overall_score}%
                                </div>
                                <Sparkles className="h-4 w-4 text-[#633ff3]" />
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  analyzeApplication(app.id)
                                }}
                                className="text-xs border-[#633ff3] text-[#633ff3] hover:bg-[#633ff3]/10"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Analyze
                              </Button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link 
                              href={`/recruiter/applications/${app.id}`}
                              className="text-[#633ff3] hover:text-[#5330d4] text-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedApp ? (
              <div className="space-y-4 sticky top-24">
                <Card className="p-6 bg-white">
                  <div className="text-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-400">
                        {selectedApp.candidate_profiles.profiles.full_name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold">{selectedApp.candidate_profiles.profiles.full_name}</h3>
                    <p className="text-sm text-gray-600">{selectedApp.candidate_profiles.current_job_title || "Candidate"}</p>
                  </div>

                  {/* AI Analysis Button */}
                  {!selectedApp.ai_analysis && !selectedApp.analyzing && (
                    <Button 
                      onClick={() => analyzeApplication(selectedApp.id)}
                      className="w-full bg-gradient-to-r from-[#633ff3] to-[#7c5aff] hover:from-[#5330d4] hover:to-[#633ff3] text-white mb-3"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Analyze Compatibility
                    </Button>
                  )}

                  {/* AI Analysis Loading */}
                  {selectedApp.analyzing && (
                    <div className="mb-3 p-4 bg-[#633ff3]/5 rounded-lg border border-[#633ff3]/20">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-[#633ff3] border-t-transparent rounded-full"></div>
                        <span className="text-sm text-[#633ff3] font-medium">Analyzing candidate fit...</span>
                      </div>
                    </div>
                  )}

                  {/* AI Compatibility Score */}
                  {selectedApp.ai_analysis && (
                    <div className={`mb-3 p-4 rounded-lg border-2 ${getScoreBgColor(selectedApp.ai_analysis.overall_score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">AI Compatibility Score</span>
                        <Sparkles className="h-4 w-4 text-[#633ff3]" />
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(selectedApp.ai_analysis.overall_score)}`}>
                        {selectedApp.ai_analysis.overall_score}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {selectedApp.ai_analysis.fit_level}
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Skills Match</span>
                          <span className="font-medium">{selectedApp.ai_analysis.score_breakdown.skills_match}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Experience</span>
                          <span className="font-medium">{selectedApp.ai_analysis.score_breakdown.experience_match}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Education</span>
                          <span className="font-medium">{selectedApp.ai_analysis.score_breakdown.education_match}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => updateApplicationStatus(selectedApp.id, 'shortlisted')}
                      className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to Interview
                    </Button>
                    <Button 
                      onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>

                {/* AI Insights */}
                {selectedApp.ai_analysis && (
                  <>
                    {/* Strengths */}
                    {selectedApp.ai_analysis.strengths.length > 0 && (
                      <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">Strengths</h3>
                        </div>
                        <ul className="space-y-2">
                          {selectedApp.ai_analysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Skill Gaps */}
                    {selectedApp.ai_analysis.skill_gaps.length > 0 && (
                      <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">Skill Gaps</h3>
                        </div>
                        <ul className="space-y-2">
                          {selectedApp.ai_analysis.skill_gaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Experience Gaps */}
                    {selectedApp.ai_analysis.experience_gaps.length > 0 && (
                      <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">Experience Gaps</h3>
                        </div>
                        <ul className="space-y-2">
                          {selectedApp.ai_analysis.experience_gaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {selectedApp.ai_analysis.recommendations.length > 0 && (
                      <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-[#633ff3]" />
                          <h3 className="font-semibold text-gray-900 text-sm">AI Recommendations</h3>
                        </div>
                        <ul className="space-y-2">
                          {selectedApp.ai_analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="text-[#633ff3] mt-0.5">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </>
                )}

                <Card className="p-6 bg-white">
                  <h3 className="font-semibold mb-4">Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{selectedApp.candidate_profiles.profiles.email}</span>
                    </div>
                    {selectedApp.candidate_profiles.profiles.phone_number && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedApp.candidate_profiles.profiles.phone_number}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6 bg-white">
                <p className="text-sm text-gray-500 text-center">Select an applicant</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
