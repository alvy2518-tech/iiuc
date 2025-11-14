"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Download, Sparkles, RefreshCw, CheckCircle2, 
  Briefcase, GraduationCap, Award, Code, Linkedin, Globe, 
  Github, ExternalLink, Copy, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cvAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"

interface Profile {
  full_name: string
  email: string
  phone_number?: string
  profile_picture_url?: string
  headline?: string
  bio?: string
  years_of_experience?: string
  current_job_title?: string
  current_company?: string
  country: string
  city: string
  linkedin_url?: string
  github_url?: string
  portfolio_website?: string
  behance_url?: string
}

interface Skill {
  skill_name: string
  skill_level: string
}

interface Experience {
  id: string
  job_title: string
  company: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  enhancedBulletPoints?: string[]
}

interface Project {
  id: string
  project_title: string
  project_type: string
  organization?: string
  start_date: string
  end_date?: string
  is_ongoing: boolean
  description: string
  project_url?: string
  technologies_used?: string[]
  enhancedBulletPoints?: string[]
}

interface Education {
  id: string
  degree: string
  field_of_study: string
  institution: string
  start_date: string
  end_date?: string
  is_current: boolean
  grade?: string
  achievements?: string
}

interface Certification {
  id: string
  certification_name: string
  issuing_organization: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
}

interface Recommendations {
  linkedin: {
    headline: string
    summary: string
    improvements: string[]
  }
  portfolio: {
    recommendations: string[]
    missingElements: string[]
  }
  general: {
    strengths: string[]
    weaknesses: string[]
    actionItems: string[]
  }
}

export default function CVBuilderPage() {
  const router = useRouter()
  const cvRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  
  const [professionalSummary, setProfessionalSummary] = useState<string>("")
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [enhancedExperience, setEnhancedExperience] = useState<Experience[]>([])
  const [enhancedProjects, setEnhancedProjects] = useState<Project[]>([])
  const [enhancing, setEnhancing] = useState(false)
  
  const [copiedText, setCopiedText] = useState<string>("")

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await cvAPI.getProfile()
      const data = response.data
      
      setProfile(data.profile)
      setSkills(data.skills || [])
      setExperience(data.experience || [])
      setProjects(data.projects || [])
      setEducation(data.education || [])
      setCertifications(data.certifications || [])
    } catch (error: any) {
      console.error("Failed to fetch profile:", error)
      alert(error.response?.data?.message || "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    try {
      setSummaryLoading(true)
      const response = await cvAPI.generateSummary()
      setProfessionalSummary(response.data.summary)
      alert("Professional summary generated!")
    } catch (error: any) {
      console.error("Failed to generate summary:", error)
      alert(error.response?.data?.message || "Failed to generate summary")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleEnhanceBullets = async (type: 'experience' | 'projects') => {
    try {
      setEnhancing(true)
      const response = await cvAPI.enhanceBullets(type)
      
      if (type === 'experience') {
        setEnhancedExperience(response.data.items)
        alert("Experience bullet points enhanced!")
      } else {
        setEnhancedProjects(response.data.items)
        alert("Project bullet points enhanced!")
      }
    } catch (error: any) {
      console.error("Failed to enhance bullets:", error)
      alert(error.response?.data?.message || "Failed to enhance bullet points")
    } finally {
      setEnhancing(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      const response = await cvAPI.generateRecommendations()
      setRecommendations(response.data.recommendations)
      alert("Recommendations generated!")
    } catch (error: any) {
      console.error("Failed to generate recommendations:", error)
      alert(error.response?.data?.message || "Failed to generate recommendations")
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (!cvRef.current) return
    
    // Use browser's print functionality for PDF export
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert("Please allow popups to export PDF")
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV - ${profile?.full_name || 'Resume'}</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
            }
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              color: #333;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header .contact {
              margin-top: 10px;
              font-size: 12px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              border-bottom: 1px solid #333;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .item {
              margin-bottom: 15px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .item-meta {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .item-description {
              font-size: 12px;
              margin-top: 5px;
            }
            .item-description ul {
              margin: 5px 0;
              padding-left: 20px;
            }
            .item-description li {
              margin-bottom: 3px;
            }
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .skill-badge {
              background: #f0f0f0;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          ${cvRef.current.innerHTML}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    alert("Copied to clipboard!")
    setTimeout(() => setCopiedText(""), 2000)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getDisplayExperience = () => {
    return enhancedExperience.length > 0 ? enhancedExperience : experience
  }

  const getDisplayProjects = () => {
    return enhancedProjects.length > 0 ? enhancedProjects : projects
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#633ff3] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please complete your profile first
            </p>
            <Button
              onClick={() => router.push('/candidate/profile/edit')}
              className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
            >
              Go to Profile
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CommonNavbar />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">CV Builder</h1>
              <p className="text-base text-gray-600">
                Generate and export your professional CV
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/candidate/profile/edit')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Suggestions Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-[#633ff3]" />
                AI Assistant
              </h2>
              
              <div className="space-y-4">
                {/* Professional Summary */}
                <div>
                  <h3 className="font-medium mb-2">Professional Summary</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="w-full"
                  >
                    {summaryLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {professionalSummary && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{professionalSummary}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6"
                        onClick={() => copyToClipboard(professionalSummary, 'summary')}
                      >
                        {copiedText === 'summary' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy
                      </Button>
                    </div>
                  )}
                </div>

                {/* Enhance Bullets */}
                <div>
                  <h3 className="font-medium mb-2">Enhance Bullet Points</h3>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnhanceBullets('experience')}
                      disabled={enhancing || experience.length === 0}
                      className="w-full"
                    >
                      {enhancing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Enhance Experience
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnhanceBullets('projects')}
                      disabled={enhancing || projects.length === 0}
                      className="w-full"
                    >
                      {enhancing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4 mr-2" />
                          Enhance Projects
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateRecommendations}
                    disabled={recommendationsLoading}
                    className="w-full"
                  >
                    {recommendationsLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recommendations Display */}
            {recommendations && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                <div className="space-y-4 text-sm">
                  {recommendations.linkedin && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-xs text-gray-600">Recommended Headline:</p>
                          <p className="text-gray-700">{recommendations.linkedin.headline}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-gray-600">Recommended Summary:</p>
                          <p className="text-gray-700">{recommendations.linkedin.summary}</p>
                        </div>
                        {recommendations.linkedin.improvements.length > 0 && (
                          <div>
                            <p className="font-medium text-xs text-gray-600">Improvements:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {recommendations.linkedin.improvements.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {recommendations.portfolio && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Portfolio
                      </h3>
                      <div className="space-y-2">
                        {recommendations.portfolio.recommendations.length > 0 && (
                          <div>
                            <p className="font-medium text-xs text-gray-600">Recommendations:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {recommendations.portfolio.recommendations.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {recommendations.portfolio.missingElements.length > 0 && (
                          <div>
                            <p className="font-medium text-xs text-gray-600">Missing Elements:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {recommendations.portfolio.missingElements.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {recommendations.general && (
                    <div>
                      <h3 className="font-medium mb-2">General</h3>
                      <div className="space-y-2">
                        {recommendations.general.actionItems.length > 0 && (
                          <div>
                            <p className="font-medium text-xs text-gray-600">Action Items:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {recommendations.general.actionItems.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* CV Preview */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white" ref={cvRef}>
              {/* Header */}
              <div className="border-b-2 border-gray-900 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>{profile.email}</div>
                  {profile.phone_number && <div>{profile.phone_number}</div>}
                  <div>{profile.city}, {profile.country}</div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {profile.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:underline">
                        <Github className="h-3 w-3 mr-1" />
                        GitHub
                      </a>
                    )}
                    {profile.portfolio_website && (
                      <a href={profile.portfolio_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-purple-600 hover:underline">
                        <Globe className="h-3 w-3 mr-1" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              {(professionalSummary || profile.bio) && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3">Professional Summary</h2>
                  <p className="text-sm text-gray-700">
                    {professionalSummary || profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill.skill_name} ({skill.skill_level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {getDisplayExperience().length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experience
                  </h2>
                  <div className="space-y-4">
                    {getDisplayExperience().map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-semibold text-gray-900">{exp.job_title}</div>
                            <div className="text-sm text-gray-600">{exp.company}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date || '')}
                          </div>
                        </div>
                        {exp.location && (
                          <div className="text-xs text-gray-500 mb-2">{exp.location}</div>
                        )}
                        {exp.enhancedBulletPoints && exp.enhancedBulletPoints.length > 0 ? (
                          <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                            {exp.enhancedBulletPoints.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                          </ul>
                        ) : exp.description && (
                          <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {getDisplayProjects().length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {getDisplayProjects().map((project) => (
                      <div key={project.id}>
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-semibold text-gray-900">{project.project_title}</div>
                            {project.organization && (
                              <div className="text-sm text-gray-600">{project.organization}</div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(project.start_date)} - {project.is_ongoing ? 'Ongoing' : formatDate(project.end_date || '')}
                          </div>
                        </div>
                        {project.technologies_used && project.technologies_used.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.technologies_used.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.enhancedBulletPoints && project.enhancedBulletPoints.length > 0 ? (
                          <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                            {project.enhancedBulletPoints.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-700 mt-2">{project.description}</p>
                        )}
                        {project.project_url && (
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center">
                            View Project <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-semibold text-gray-900">{edu.degree}</div>
                            <div className="text-sm text-gray-600">{edu.institution}</div>
                            <div className="text-xs text-gray-500">{edu.field_of_study}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : formatDate(edu.end_date || '')}
                          </div>
                        </div>
                        {edu.grade && (
                          <div className="text-sm text-gray-700 mt-1">Grade: {edu.grade}</div>
                        )}
                        {edu.achievements && (
                          <p className="text-sm text-gray-700 mt-1">{edu.achievements}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b border-gray-900 pb-1 mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Certifications
                  </h2>
                  <div className="space-y-3">
                    {certifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="font-semibold text-gray-900">{cert.certification_name}</div>
                        <div className="text-sm text-gray-600">{cert.issuing_organization}</div>
                        <div className="text-xs text-gray-500">
                          Issued: {formatDate(cert.issue_date)}
                          {cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
                        </div>
                        {cert.credential_id && (
                          <div className="text-xs text-gray-500">Credential ID: {cert.credential_id}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

