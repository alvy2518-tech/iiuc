"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { jobsAPI, applicationsAPI, savedJobsAPI } from "@/lib/api"
import { MapPin, Briefcase, Clock, Building2, DollarSign, Calendar, Loader2, CheckCircle2, XCircle, Bookmark, Share2, TrendingUp, Heart } from "lucide-react"
import { CommonNavbar } from "@/components/common-navbar"
import { useLanguage } from "@/components/language-provider"
import { SkillMatchingCard } from "@/components/skill-matching-card"
import Link from "next/link"

// Add custom styles for the modal
const styles = `
  :root {
    --modal-bg-color: white;
  }
  
  .dark {
    --modal-bg-color: #1e1e2d;
  }
`

interface Job {
  id: string
  job_title: string
  department: string
  job_type: string
  work_mode: string
  experience_level: string
  country: string
  city: string
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
  recruiter_profiles: {
    company_name: string
    company_size?: string
    industry?: string
  }
  job_skills: Array<{ skill_name: string }>
}

export default function ViewJobPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [applicationError, setApplicationError] = useState("")
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resumeUrl: ""
  })
  const [hasApplied, setHasApplied] = useState(false)
  const [checkingApplication, setCheckingApplication] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInterested, setIsInterested] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  
  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    loadJob()
    checkIfApplied()
    checkJobStatus()
  }, [params.id])

  const loadJob = async () => {
    try {
      const response = await jobsAPI.getById(params.id as string)
      const jobData = response.data.job || response.data
      
      // Check if recruiter_profiles exists
      if (!jobData.recruiter_profiles) {
        console.error("Missing recruiter_profiles in job data:", jobData)
        setError("Job data is incomplete - missing company information")
        return
      }
      
      setJob(jobData)
    } catch (err: any) {
      console.error("Error loading job:", err)
      setError(err.response?.data?.message || "Failed to load job")
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    try {
      setCheckingApplication(true)
      const response = await applicationsAPI.getCandidateApplications()
      const applications = response.data.applications || []
      
      console.log('Checking applications for job:', params.id)
      console.log('All applications:', applications)
      
      // Check if user has already applied to this job
      const alreadyApplied = applications.some(
        (app: any) => app.job_id === params.id || app.job_id === String(params.id)
      )
      
      console.log('Already applied:', alreadyApplied)
      setHasApplied(alreadyApplied)
    } catch (err: any) {
      // Handle errors gracefully - user not logged in, no profile, or no applications
      if (err.response?.status === 401 || err.response?.status === 404) {
        // User not authenticated or candidate profile doesn't exist yet
        console.log("Not authenticated or profile not found, showing as not applied")
        setHasApplied(false)
      } else {
        // For other errors, just log but don't block the UI
        console.warn("Could not check application status:", err.response?.status || err.message)
        setHasApplied(false)
      }
    } finally {
      setCheckingApplication(false)
    }
  }

  const checkJobStatus = async () => {
    try {
      const response = await savedJobsAPI.checkJobStatus(params.id as string)
      setIsSaved(response.data.saved)
      setIsInterested(response.data.interested)
    } catch (err) {
      console.error("Error checking job status:", err)
    }
  }

  const handleSaveJob = async () => {
    try {
      setSavingJob(true)
      if (isSaved) {
        await savedJobsAPI.removeSavedJob(params.id as string)
        setIsSaved(false)
      } else {
        await savedJobsAPI.saveJob(params.id as string)
        setIsSaved(true)
      }
    } catch (err) {
      console.error("Error saving job:", err)
    } finally {
      setSavingJob(false)
    }
  }

  const handleInterestedJob = async () => {
    try {
      setSavingJob(true)
      if (isInterested) {
        await savedJobsAPI.removeInterestedJob(params.id as string)
        setIsInterested(false)
      } else {
        await savedJobsAPI.addInterestedJob(params.id as string)
        setIsInterested(true)
      }
    } catch (err) {
      console.error("Error marking job as interested:", err)
    } finally {
      setSavingJob(false)
    }
  }

  const handleApply = () => {
    setShowApplicationForm(true)
  }
  
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplying(true)
    setApplicationError("")
    
    try {
      // Validate jobId format
      const jobId = params.id as string
      if (!jobId || typeof jobId !== 'string') {
        setApplicationError(t('jobs.invalidJobId'))
        setApplying(false)
        return
      }

      // Validate and prepare resumeUrl
      let resumeUrl: string | null = null
      const trimmedResumeUrl = applicationData.resumeUrl.trim()
      if (trimmedResumeUrl) {
        // If resumeUrl is provided, validate it's a proper URL
        if (!isValidUrl(trimmedResumeUrl)) {
          setApplicationError(t('jobs.invalidResumeUrl'))
          setApplying(false)
          return
        }
        resumeUrl = trimmedResumeUrl
      }
      
      // Prepare coverLetter - send null if empty
      const coverLetter = applicationData.coverLetter.trim() || null
      
      // Prepare data matching backend validator expectations
      const submitData = {
        jobId: jobId,
        coverLetter: coverLetter,
        resumeUrl: resumeUrl
      }

      console.log("Submitting application data:", submitData)
      
      await applicationsAPI.apply(submitData)
      
      setApplicationSuccess(true)
      setHasApplied(true)
      
      // Re-check application status to ensure consistency
      setTimeout(async () => {
        await checkIfApplied()
      }, 500)
      
      // Close modal and show success state after a delay
      setTimeout(() => {
        setShowApplicationForm(false)
        setApplicationSuccess(false)
        // Reset form
        setApplicationData({
          coverLetter: "",
          resumeUrl: ""
        })
      }, 2000)
    } catch (err: any) {
      console.error("Error applying for job:", err)
      console.error("Error details:", err.response?.data)
      
      // Provide more detailed error message
      let errorMessage = t('jobs.failedToSubmit')
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
        
        // If backend says already applied, update the state
        if (errorMessage.includes('already applied')) {
          setHasApplied(true)
          setTimeout(() => {
            setShowApplicationForm(false)
          }, 2000)
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setApplicationError(errorMessage)
    } finally {
      setApplying(false)
    }
  }

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">{t('jobs.loadingDetails')}</div>
        </div>
      </div>
    )
  }

  if (error || !job || !job.recruiter_profiles) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || t('jobs.jobNotFound')}</p>
            <Button onClick={() => router.push("/candidate/jobs")}>
              {t('jobs.backToJobs')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommonNavbar />
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.job_title}</h1>
                  <p className="text-lg text-gray-700">
                    {job.recruiter_profiles.company_name} - {job.city}, {job.country} - {job.job_type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveJob}
                    disabled={savingJob}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title={isSaved ? "Remove from saved" : "Save for later"}
                  >
                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-[#633ff3] text-[#633ff3]' : 'text-gray-600'}`} />
                  </button>
                  <button 
                    onClick={handleInterestedJob}
                    disabled={savingJob}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title={isInterested ? "Remove from interested" : "Mark as interested"}
                  >
                    <Heart className={`h-5 w-5 ${isInterested ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('jobs.jobDescription')}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.job_description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('jobs.responsibilities')}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.responsibilities.split('\n').map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
              </ul>
            </div>

            {/* Required Qualifications */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('jobs.requiredQualifications')}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.qualifications.split('\n').map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
              </ul>
            </div>

            {/* Preferred Qualifications */}
            {job.nice_to_have && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('jobs.preferredQualifications')}</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.nice_to_have.split('\n').map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Action Buttons */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
                {checkingApplication ? (
                  <Button disabled className="w-full h-12">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('jobs.checking')}
                  </Button>
                ) : hasApplied ? (
                  <Button disabled variant="outline" className="w-full h-12 bg-green-50 border-green-200 text-green-600">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t('jobs.alreadyApplied')}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleApply} className="w-full h-12 bg-[#633ff3] hover:bg-[#5330d4] text-white">
                      {t('jobs.applyNow')}
                    </Button>
                    <Button 
                      onClick={handleSaveJob}
                      disabled={savingJob}
                      variant="outline" 
                      className={`w-full h-12 ${isSaved ? 'border-[#633ff3] bg-[#633ff3]/10 text-[#633ff3]' : 'border-gray-300 text-gray-700 hover:border-[#633ff3] hover:text-[#633ff3]'}`}
                    >
                      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? t('jobs.saved') : t('jobs.saveForLater')}
                    </Button>
                    <Button 
                      onClick={handleInterestedJob}
                      disabled={savingJob}
                      variant="outline"
                      className={`w-full h-12 ${isInterested ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'}`}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
                      {isInterested ? t('jobs.interested') : t('jobs.markAsInterested')}
                    </Button>
                  </>
                )}
              </div>

              {/* Job Details */}
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{t('jobs.jobDetails')}</h3>
                <div className="space-y-3">
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t('jobs.salaryRange')}</p>
                        <p className="font-medium text-gray-900">
                          {job.salary_min && job.salary_max
                            ? `${job.salary_currency || '$'}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                            : job.salary_min
                            ? `${t('jobs.from')} ${job.salary_currency || '$'}${job.salary_min.toLocaleString()}`
                            : job.salary_max
                            ? `${t('jobs.upTo')} ${job.salary_currency || '$'}${job.salary_max.toLocaleString()}`
                            : t('jobs.notSpecified')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{t('jobs.experienceLevel')}</p>
                      <p className="font-medium text-gray-900">{job.experience_level}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{t('jobs.postedOn')}</p>
                      <p className="font-medium text-gray-900">{new Date(job.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Skill Matching Analysis */}
              <SkillMatchingCard jobId={params.id as string} />

              {/* Skills */}
              {job.job_skills.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('jobs.skills')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.job_skills.map((skill, idx) => (
                      <span
                        key={`skill-${idx}`}
                        className="px-3 py-1 rounded-full bg-[#633ff3]/10 text-[#633ff3] text-xs font-medium"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* About the Company */}
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{t('jobs.aboutCompany')}</h3>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#633ff3]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-[#633ff3]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.recruiter_profiles.company_name}</p>
                    <Link href="#" className="text-sm text-[#633ff3] hover:underline">{t('jobs.viewCompanyProfile')}</Link>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {job.recruiter_profiles.company_name} is a leading technology company dedicated to creating cutting-edge solutions. We are committed to excellence and innovation.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div 
                className="rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg border border-border dark:border-[#272b3f]"
                style={{backgroundColor: isDarkMode ? '#17141f' : 'white'}}>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{t('jobs.applyFor', { jobTitle: job.job_title })}</h2>
                    <button 
                      onClick={() => setShowApplicationForm(false)}
                      className="p-1 rounded-full hover:bg-muted"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {applicationSuccess ? (
                    <div className="py-8 text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-600">{t('jobs.applicationSubmitted')}</h3>
                      <p className="text-muted-foreground">
                        {t('jobs.applicationSuccess')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      {applicationError && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                          {applicationError}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">{t('jobs.coverLetter')} ({t('jobs.optional')})</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder={t('jobs.coverLetterPlaceholder')}
                          rows={5}
                          value={applicationData.coverLetter}
                          onChange={(e) => setApplicationData({
                            ...applicationData,
                            coverLetter: e.target.value
                          })}
                          className="dark:bg-[#1e1b2c] dark:border-[#272b3f]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="resumeUrl">{t('jobs.resumeUrl')} ({t('jobs.optional')})</Label>
                        <Input
                          id="resumeUrl"
                          type="url"
                          placeholder="https://example.com/my-resume.pdf"
                          value={applicationData.resumeUrl}
                          onChange={(e) => setApplicationData({
                            ...applicationData,
                            resumeUrl: e.target.value
                          })}
                          className="dark:bg-[#1e1b2c] dark:border-[#272b3f]"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('jobs.resumeUrlHelp')}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full h-11"
                          disabled={applying}
                        >
                          {applying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('jobs.submitting')}
                            </>
                          ) : t('jobs.submitApplication')}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  )
}
