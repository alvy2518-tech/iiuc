"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { applicationsAPI } from "@/lib/api"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Award, 
  Star, 
  FileText, 
  ExternalLink, 
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Loader2,
  ArrowLeft
} from "lucide-react"

interface Application {
  id: string
  job_id: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  cover_letter?: string
  resume_url?: string
  applied_at: string
  jobs: {
    id: string
    job_title: string
    recruiter_id: string
  }
  candidate_profiles: {
    id: string
    headline?: string
    bio?: string
    current_job_title?: string
    current_company?: string
    years_of_experience?: string
    country?: string
    city?: string
    portfolio_website?: string
    linkedin_url?: string
    github_url?: string
    behance_url?: string
    profiles: {
      full_name: string
      email: string
      phone_number?: string
      profile_picture_url?: string
    }
  }
  candidate_details: {
    skills: Array<{
      id: string
      skill_name: string
      skill_level: string
    }>
    experience: Array<{
      id: string
      job_title: string
      company: string
      location?: string
      start_date: string
      end_date?: string
      is_current: boolean
      description?: string
    }>
    education: Array<{
      id: string
      degree: string
      field_of_study: string
      institution: string
      start_date: string
      end_date?: string
      is_current: boolean
      grade?: string
    }>
    certifications: Array<{
      id: string
      certification_name: string
      issuing_organization: string
      issue_date: string
      expiry_date?: string
      does_not_expire: boolean
      credential_url?: string
    }>
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    loadApplication()
  }, [params.id])

  const loadApplication = async () => {
    try {
      const response = await applicationsAPI.getApplicationById(params.id as string)
      setApplication(response.data.application)
    } catch (err: any) {
      console.error("Error loading application:", err)
      setError(err.response?.data?.message || "Failed to load application")
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (newStatus: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired') => {
    if (!application) return
    
    setUpdatingStatus(true)
    try {
      await applicationsAPI.updateApplicationStatus(application.id, newStatus)
      setApplication({
        ...application,
        status: newStatus
      })
    } catch (err) {
      console.error("Error updating application status:", err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-7">
              <div className="text-center text-gray-600">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading application details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-7">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error || "Application not found"}</p>
                <Button onClick={() => router.push(`/recruiter/jobs/${application?.job_id || ''}`)}>
                  Back to Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const candidate = application.candidate_profiles
  const candidateDetails = application.candidate_details

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <RecruiterSidebar />

          {/* Main Content */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push(`/recruiter/jobs/${application.job_id}`)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Job
                </Button>
              </div>

              {/* Application Header */}
              <Card className="p-6 bg-white border border-gray-200 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {candidate.profiles.profile_picture_url ? (
                        <img 
                          src={candidate.profiles.profile_picture_url} 
                          alt={candidate.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-gray-400">
                          {candidate.profiles.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{candidate.profiles.full_name}</h1>
                      <p className="text-gray-600">
                        {candidate.headline || candidate.current_job_title || "Candidate"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">
                      Applied for <Link href={`/recruiter/jobs/${application.job_id}`} className="font-medium text-[#633ff3] hover:underline">{application.jobs.job_title}</Link>
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(application.applied_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
            
                {/* Application Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="text-sm font-medium text-gray-700">Application Status:</div>
                  <div className="flex-1">
                    <select 
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(e.target.value as any)}
                      disabled={updatingStatus}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#633ff3]/20 w-full sm:w-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                </div>
            
                {/* Contact Info */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {candidate.profiles.email && (
                    <a 
                      href={`mailto:${candidate.profiles.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Mail className="h-4 w-4" />
                      {candidate.profiles.email}
                    </a>
                  )}
                  
                  {candidate.profiles.phone_number && (
                    <a 
                      href={`tel:${candidate.profiles.phone_number}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      {candidate.profiles.phone_number}
                    </a>
                  )}
                  
                  {candidate.portfolio_website && (
                    <a 
                      href={candidate.portfolio_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                  
                  {candidate.linkedin_url && (
                    <a 
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  
                  {candidate.github_url && (
                    <a 
                      href={candidate.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </Card>
          
              {/* Cover Letter */}
              {application.cover_letter && (
                <Card className="p-6 bg-white border border-gray-200 space-y-3">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Cover Letter
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap">{application.cover_letter}</p>
                  </div>
                </Card>
              )}
              
              {/* Resume */}
              {application.resume_url && (
                <Card className="p-6 bg-white border border-gray-200">
                  <a 
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#633ff3] hover:underline"
                  >
                    <FileText className="h-5 w-5" />
                    View Resume
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Card>
              )}
          
              {/* Skills */}
              {candidateDetails.skills.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 space-y-3">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {candidateDetails.skills.map((skill) => (
                      <div 
                        key={skill.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-gray-50"
                      >
                        <span className="text-gray-900">{skill.skill_name}</span>
                        <span className="rounded-full bg-[#633ff3]/10 px-2 py-0.5 text-xs text-[#633ff3]">
                          {skill.skill_level}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          
              {/* Experience */}
              {candidateDetails.experience.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 space-y-4">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experience
                  </h2>
                  <div className="space-y-5">
                    {candidateDetails.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                        <p className="text-sm text-gray-600">
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-sm mt-2 whitespace-pre-wrap text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {/* Education */}
              {candidateDetails.education.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 space-y-4">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h2>
                  <div className="space-y-5">
                    {candidateDetails.education.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <h3 className="font-medium text-gray-900">{edu.degree} in {edu.field_of_study}</h3>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                          {edu.grade && ` • ${edu.grade}`}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : edu.end_date ? formatDate(edu.end_date) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {/* Certifications */}
              {candidateDetails.certifications.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 space-y-4">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Certifications
                  </h2>
                  <div className="space-y-5">
                    {candidateDetails.certifications.map((cert) => (
                      <div key={cert.id} className="space-y-1">
                        <h3 className="font-medium text-gray-900">{cert.certification_name}</h3>
                        <p className="text-sm text-gray-600">
                          {cert.issuing_organization}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Issued: {formatDate(cert.issue_date)}
                          {!cert.does_not_expire && cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
                          {cert.does_not_expire && ' • No Expiration'}
                        </p>
                        {cert.credential_url && (
                          <a 
                            href={cert.credential_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#633ff3] hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Verify Credential
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {/* About/Bio */}
              {candidate.bio && (
                <Card className="p-6 bg-white border border-gray-200 space-y-3">
                  <h2 className="font-semibold text-gray-900">About</h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap">{candidate.bio}</p>
                  </div>
                </Card>
              )}
              
              {/* Location */}
              {(candidate.country || candidate.city) && (
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">
                      {candidate.city && candidate.country 
                        ? `${candidate.city}, ${candidate.country}`
                        : candidate.city || candidate.country}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
