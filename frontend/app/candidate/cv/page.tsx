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
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

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

  const handleExportPDF = async () => {
    if (!cvRef.current) return
    
    try {
      // Show loading state
      const downloadBtn = document.querySelector('[data-download-btn]') as HTMLElement
      const originalText = downloadBtn?.textContent
      if (downloadBtn) {
        downloadBtn.textContent = 'Generating PDF...'
        downloadBtn.setAttribute('disabled', 'true')
      }

      // Create a temporary container with better styling for PDF
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = '210mm' // A4 width
      tempContainer.style.padding = '10mm 15mm' // Top/bottom: 10mm, Left/right: 15mm
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.fontFamily = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      tempContainer.style.boxSizing = 'border-box'
      
      // Clone the CV content
      const clonedContent = cvRef.current.cloneNode(true) as HTMLElement
      
      // Apply PDF-specific styles
      clonedContent.style.width = '100%'
      clonedContent.style.backgroundColor = '#ffffff'
      clonedContent.style.color = '#1a1a1a'
      clonedContent.style.fontSize = '11pt'
      clonedContent.style.lineHeight = '1.6'
      clonedContent.style.margin = '0'
      clonedContent.style.padding = '0'
      
      // Remove Card padding and apply our own
      const cardElement = clonedContent.querySelector('[class*="Card"]') || clonedContent
      if (cardElement && cardElement instanceof HTMLElement && cardElement.style) {
        cardElement.style.setProperty('padding', '0')
        cardElement.style.setProperty('margin', '0')
        cardElement.style.setProperty('box-shadow', 'none')
        cardElement.style.setProperty('border', 'none')
      }
      
      // Style all sections for PDF with better spacing
      const sections = clonedContent.querySelectorAll('[class*="mb-6"], [class*="mb-4"]')
      sections.forEach((section: any) => {
        if (section instanceof HTMLElement && section.style) {
          section.style.setProperty('margin-bottom', '18px')
          section.style.setProperty('margin-top', '0')
          section.style.setProperty('page-break-inside', 'avoid')
          section.style.setProperty('break-inside', 'avoid')
        }
      })
      
      // Style the header section specifically
      const headerSection = clonedContent.querySelector('[class*="border-b"]')
      if (headerSection && headerSection instanceof HTMLElement && headerSection.style) {
        headerSection.style.setProperty('margin-bottom', '16px')
        headerSection.style.setProperty('padding-bottom', '12px')
      }
      
      // Style headers
      const headers = clonedContent.querySelectorAll('h1, h2')
      headers.forEach((header: any) => {
        if (header instanceof HTMLElement && header.style) {
          if (header.tagName === 'H1') {
            header.style.setProperty('font-size', '24pt')
            header.style.setProperty('font-weight', '700')
            header.style.setProperty('color', '#1a1a1a')
            header.style.setProperty('margin-top', '0')
            header.style.setProperty('margin-bottom', '8px')
            header.style.setProperty('padding-bottom', '8px')
            header.style.setProperty('border-bottom', '3px solid #633ff3')
          } else if (header.tagName === 'H2') {
            header.style.setProperty('font-size', '14pt')
            header.style.setProperty('font-weight', '600')
            header.style.setProperty('color', '#633ff3')
            header.style.setProperty('margin-top', '16px')
            header.style.setProperty('margin-bottom', '10px')
            header.style.setProperty('padding-bottom', '5px')
            header.style.setProperty('border-bottom', '2px solid #e5e7eb')
            header.style.setProperty('page-break-after', 'avoid')
          }
        }
      })
      
      // Style contact info
      const contactInfo = clonedContent.querySelectorAll('[class*="text-sm"]')
      contactInfo.forEach((el: any) => {
        if (el instanceof HTMLElement && el.style && el.textContent && (el.textContent.includes('@') || el.textContent.includes('+') || el.textContent.includes(','))) {
          el.style.setProperty('margin-bottom', '4px')
          el.style.setProperty('font-size', '10pt')
          el.style.setProperty('line-height', '1.5')
        }
      })
      
      // Style paragraphs and text
      const paragraphs = clonedContent.querySelectorAll('p')
      paragraphs.forEach((p: any) => {
        if (p instanceof HTMLElement && p.style) {
          p.style.setProperty('color', '#374151')
          p.style.setProperty('font-size', '10.5pt')
          p.style.setProperty('line-height', '1.6')
          p.style.setProperty('margin-top', '0')
          p.style.setProperty('margin-bottom', '8px')
        }
      })
      
      // Style badges
      const badges = clonedContent.querySelectorAll('[class*="Badge"], span[class*="bg-"]')
      badges.forEach((badge: any) => {
        if (badge instanceof HTMLElement && badge.style) {
          badge.style.setProperty('background-color', '#f3f4f6')
          badge.style.setProperty('color', '#1f2937')
          badge.style.setProperty('padding', '3px 8px')
          badge.style.setProperty('border-radius', '3px')
          badge.style.setProperty('font-size', '9pt')
          badge.style.setProperty('display', 'inline-block')
          badge.style.setProperty('margin', '2px 4px 2px 0')
          badge.style.setProperty('vertical-align', 'middle')
        }
      })
      
      // Style links
      const links = clonedContent.querySelectorAll('a')
      links.forEach((link: any) => {
        if (link instanceof HTMLElement && link.style) {
          link.style.setProperty('color', '#633ff3')
          link.style.setProperty('text-decoration', 'none')
          link.style.setProperty('font-size', '10pt')
        }
      })
      
      // Style experience/project/education items
      const items = clonedContent.querySelectorAll('[class*="border-l-4"]')
      items.forEach((item: any) => {
        if (item instanceof HTMLElement && item.style) {
          item.style.setProperty('margin-bottom', '14px')
          item.style.setProperty('padding-left', '12px')
          item.style.setProperty('page-break-inside', 'avoid')
        }
      })
      
      // Style lists
      const lists = clonedContent.querySelectorAll('ul')
      lists.forEach((list: any) => {
        if (list instanceof HTMLElement && list.style) {
          list.style.setProperty('margin-left', '18px')
          list.style.setProperty('margin-top', '6px')
          list.style.setProperty('margin-bottom', '6px')
          list.style.setProperty('padding-left', '0')
        }
      })
      
      const listItems = clonedContent.querySelectorAll('li')
      listItems.forEach((li: any) => {
        if (li instanceof HTMLElement && li.style) {
          li.style.setProperty('margin-bottom', '3px')
          li.style.setProperty('font-size', '10pt')
          li.style.setProperty('color', '#4b5563')
          li.style.setProperty('line-height', '1.5')
        }
      })
      
      // Style date ranges and metadata
      const dateRanges = clonedContent.querySelectorAll('[class*="text-sm"][class*="text-gray"]')
      dateRanges.forEach((el: any) => {
        if (el instanceof HTMLElement && el.style && el.textContent && (el.textContent.includes('Present') || el.textContent.includes('20'))) {
          el.style.setProperty('font-size', '9.5pt')
          el.style.setProperty('margin-bottom', '4px')
        }
      })
      
      // Ensure proper spacing for flex containers
      const flexContainers = clonedContent.querySelectorAll('[class*="flex"]')
      flexContainers.forEach((container: any) => {
        if (container instanceof HTMLElement && container.style) {
          container.style.setProperty('gap', '8px')
        }
      })
      
      tempContainer.appendChild(clonedContent)
      document.body.appendChild(tempContainer)
      
      // Generate canvas - html2canvas will handle the rendering
      // Wrap in try-catch to handle any color parsing errors
      let canvas
      try {
        canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: tempContainer.scrollWidth,
          height: tempContainer.scrollHeight,
          onclone: (clonedDoc) => {
            // Remove external stylesheets that might contain lab() colors
            try {
              const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]')
              linkTags.forEach((tag) => {
                tag.remove()
              })
              
              // Process all elements to ensure colors are in supported format
              const allElements = clonedDoc.querySelectorAll('*')
              allElements.forEach((el: any) => {
                if (el.style) {
                  try {
                    // Use the cloned document's window for getComputedStyle
                    const win = clonedDoc.defaultView || (clonedDoc as any).parentWindow
                    if (win) {
                      const computed = win.getComputedStyle(el)
                      
                      // Convert colors to rgb/hex format (getComputedStyle should already return rgb)
                      const color = computed.color
                      const bgColor = computed.backgroundColor
                      const borderColor = computed.borderColor
                      
                      // Only update if the value is valid and not transparent
                      if (color && !color.includes('lab(') && color !== 'rgba(0, 0, 0, 0)') {
                        el.style.color = color
                      }
                      if (bgColor && !bgColor.includes('lab(') && bgColor !== 'rgba(0, 0, 0, 0)') {
                        el.style.backgroundColor = bgColor
                      }
                      if (borderColor && !borderColor.includes('lab(') && borderColor !== 'rgba(0, 0, 0, 0)') {
                        el.style.borderColor = borderColor
                      }
                    }
                  } catch (e) {
                    // Ignore errors for individual elements
                  }
                }
              })
            } catch (e) {
              console.warn('Error processing cloned document:', e)
            }
          }
        })
      } catch (error: any) {
        // If html2canvas fails due to color parsing, try with simpler options
        console.warn('html2canvas error, retrying with simplified options:', error)
        canvas = await html2canvas(tempContainer, {
          scale: 1.5,
          useCORS: false,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        })
      }
      
      // Remove temporary container
      document.body.removeChild(tempContainer)
      
      // Calculate PDF dimensions with proper margins
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const margin = 10 // Top/bottom margin in mm
      const sideMargin = 15 // Left/right margin in mm
      const contentWidth = pdfWidth - (sideMargin * 2)
      const contentHeight = pdfHeight - (margin * 2)
      
      // Calculate image dimensions maintaining aspect ratio
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Create PDF with proper margins
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      let heightLeft = imgHeight
      let position = margin
      
      // Add first page with margins
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0), 
        'PNG', 
        sideMargin, 
        position, 
        contentWidth, 
        imgHeight
      )
      heightLeft -= contentHeight
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0), 
          'PNG', 
          sideMargin, 
          position, 
          contentWidth, 
          imgHeight
        )
        heightLeft -= contentHeight
      }
      
      // Download PDF
      const fileName = `${profile?.full_name?.replace(/\s+/g, '_') || 'CV'}_Resume.pdf`
      pdf.save(fileName)
      
      // Reset button
      if (downloadBtn) {
        downloadBtn.textContent = originalText || 'Export PDF'
        downloadBtn.removeAttribute('disabled')
      }
      
      alert("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
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
                data-download-btn
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
            <Card className="p-8 bg-white shadow-xl" ref={cvRef} style={{ maxWidth: '210mm', margin: '0 auto' }}>
              {/* Header */}
              <div className="border-b-4 border-[#633ff3] pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{profile.full_name}</h1>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.email}</span>
                  </div>
                  {profile.phone_number && (
                    <div className="flex items-center gap-2">
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <Linkedin className="h-4 w-4 mr-1" />
                        <span className="text-xs">LinkedIn</span>
                      </a>
                    )}
                    {profile.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                        <Github className="h-4 w-4 mr-1" />
                        <span className="text-xs">GitHub</span>
                      </a>
                    )}
                    {profile.portfolio_website && (
                      <a href={profile.portfolio_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
                        <Globe className="h-4 w-4 mr-1" />
                        <span className="text-xs">Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              {(professionalSummary || profile.bio) && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-3">Professional Summary</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {professionalSummary || profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                        {skill.skill_name} <span className="text-gray-500">({skill.skill_level})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {getDisplayExperience().length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experience
                  </h2>
                  <div className="space-y-5">
                    {getDisplayExperience().map((exp) => (
                      <div key={exp.id} className="border-l-4 border-[#633ff3] pl-4 pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900 text-base">{exp.job_title}</div>
                            <div className="text-sm text-gray-600 font-medium">{exp.company}</div>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date || '')}
                          </div>
                        </div>
                        {exp.location && (
                          <div className="text-xs text-gray-500 mb-3">{exp.location}</div>
                        )}
                        {exp.enhancedBulletPoints && exp.enhancedBulletPoints.length > 0 ? (
                          <ul className="text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
                            {exp.enhancedBulletPoints.map((bullet, idx) => (
                              <li key={idx} className="leading-relaxed">{bullet}</li>
                            ))}
                          </ul>
                        ) : exp.description && (
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {getDisplayProjects().length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-4 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Projects
                  </h2>
                  <div className="space-y-5">
                    {getDisplayProjects().map((project) => (
                      <div key={project.id} className="border-l-4 border-[#633ff3] pl-4 pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900 text-base">{project.project_title}</div>
                            {project.organization && (
                              <div className="text-sm text-gray-600 font-medium">{project.organization}</div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            {formatDate(project.start_date)} - {project.is_ongoing ? 'Ongoing' : formatDate(project.end_date || '')}
                          </div>
                        </div>
                        {project.technologies_used && project.technologies_used.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies_used.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.enhancedBulletPoints && project.enhancedBulletPoints.length > 0 ? (
                          <ul className="text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
                            {project.enhancedBulletPoints.map((bullet, idx) => (
                              <li key={idx} className="leading-relaxed">{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{project.description}</p>
                        )}
                        {project.project_url && (
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#633ff3] hover:text-[#5330d4] hover:underline mt-2 inline-flex items-center font-medium">
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
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="border-l-4 border-[#633ff3] pl-4 pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900 text-base">{edu.degree}</div>
                            <div className="text-sm text-gray-600 font-medium">{edu.institution}</div>
                            <div className="text-xs text-gray-500 mt-1">{edu.field_of_study}</div>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : formatDate(edu.end_date || '')}
                          </div>
                        </div>
                        {edu.grade && (
                          <div className="text-sm text-gray-700 mt-2 font-medium">Grade: <span className="font-normal">{edu.grade}</span></div>
                        )}
                        {edu.achievements && (
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{edu.achievements}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#633ff3] border-b-2 border-gray-200 pb-2 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Certifications
                  </h2>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="border-l-4 border-[#633ff3] pl-4 pb-2">
                        <div className="font-semibold text-gray-900 text-base">{cert.certification_name}</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">{cert.issuing_organization}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Issued: {formatDate(cert.issue_date)}
                          {cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
                        </div>
                        {cert.credential_id && (
                          <div className="text-xs text-gray-500 mt-1">Credential ID: <span className="font-mono">{cert.credential_id}</span></div>
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

