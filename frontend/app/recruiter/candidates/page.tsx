"use client"

import { useEffect, useState } from "react"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { profileAPI } from "@/lib/api"
import { Download } from "lucide-react"

export default function RecruiterCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await profileAPI.listCandidates()
        setCandidates(res.data.candidates || [])
      } catch (e) {
        console.error("Failed to fetch candidates", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDownloadResume = async (candidateId: string, candidateName: string) => {
    try {
      setDownloading(candidateId)
      const response = await profileAPI.downloadResume(candidateId)
      
      // Create blob and download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${candidateName.replace(/\s+/g, '_')}_resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Download error:', err)
      if (err.response?.status === 404) {
        alert('No resume found for this candidate')
      } else {
        alert('Failed to download resume')
      }
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RecruiterSidebar />
          <div className="lg:col-span-9">
            <h1 className="text-2xl font-bold mb-4">Candidates</h1>
            {loading ? (
              <div className="text-muted-foreground">Loading candidates...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((c) => (
                  <div key={c.id} className="rounded-lg border p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.profiles?.profile_picture_url || "/vercel.svg"}
                        alt={c.profiles?.full_name || "Candidate"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{c.profiles?.full_name || "Unnamed"}</div>
                        <div className="text-xs text-muted-foreground">{c.city}, {c.country}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {c.headline || "No headline"}
                    </div>
                    
                    {/* Download Resume Button */}
                    {c.resume_filename && (
                      <button
                        onClick={() => handleDownloadResume(c.id, c.profiles?.full_name || 'candidate')}
                        disabled={downloading === c.id}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Download size={16} />
                        {downloading === c.id ? 'Downloading...' : 'Download Resume'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


