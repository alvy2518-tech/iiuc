"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChatBox } from '@/components/chat-box'
import { RecruiterNavbar } from '@/components/recruiter-navbar'
import { RecruiterSidebar } from '@/components/recruiter-sidebar'
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  Phone,
  Mail,
  Building2,
  Clock,
  Sparkles,
  ChevronDown,
  Video,
  FileText,
  X,
  Loader2,
  Trash2
} from 'lucide-react'
import { interviewAPI, messagingAPI, applicationsAPI } from '@/lib/api'

interface Candidate {
  id: string
  status: string
  applied_at: string
  ai_analysis_score: number | null
  ai_analysis_data: {
    compatibility_score: number
    fit_level: string
    strengths: string[]
    skill_gaps: string[]
    experience_gaps: string[]
    recommendations: string[]
  } | null
  ai_analyzed_at: string | null
  candidate: {
    id: string
    user_id: string
    headline: string
    current_job_title: string
    current_company: string
    city?: string
    country?: string
    bio?: string
    years_of_experience?: number
    profile: {
      full_name: string
      email: string
      phone_number: string
      profile_picture_url: string
    }
    skills?: Array<{
      skill_name: string
      skill_level: string
    }>
    experience?: Array<{
      job_title: string
      company: string
      start_date: string
      end_date: string
      is_current: boolean
    }>
    education?: Array<{
      degree: string
      field_of_study: string
      institution: string
      start_date: string
      end_date: string
      is_current: boolean
    }>
  }
  conversation: {
    id: string
    is_initiated: boolean
    last_message_at: string
    recruiter_unread_count: number
  }[]
}

interface Job {
  id: string
  job_title: string
  department: string
  job_type: string
  location: string
  selected_candidates: Candidate[]
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const jobIdParam = searchParams.get('jobId')
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsCandidate, setDetailsCandidate] = useState<Candidate | null>(null)
  const [initiatingChat, setInitiatingChat] = useState(false)
  const [rejectingCandidate, setRejectingCandidate] = useState(false)
  // Track which candidates have had conversations initiated (in this session)
  const [initiatedConversations, setInitiatedConversations] = useState<Set<string>>(new Set())

  // Helper function to get AI score color
  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400'
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Helper function to get fit level badge
  const getFitLevelBadge = (score: number | null): { text: string; className: string } => {
    if (!score) return { text: 'Not Analyzed', className: 'bg-gray-100 text-gray-600' }
    if (score >= 85) return { text: 'Excellent Match', className: 'bg-green-100 text-green-700' }
    if (score >= 70) return { text: 'Good Match', className: 'bg-blue-100 text-blue-700' }
    if (score >= 60) return { text: 'Potential Match', className: 'bg-yellow-100 text-yellow-700' }
    return { text: 'Weak Match', className: 'bg-red-100 text-red-700' }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const response = await interviewAPI.getRecruiterInterviews()
      console.log('Interview response:', response.data)
      
      setJobs(response.data.jobs || [])
      
      if (response.data.jobs && response.data.jobs.length > 0) {
        const jobToSelect = jobIdParam 
          ? response.data.jobs.find((job: Job) => job.id === jobIdParam)
          : response.data.jobs[0]
        
        if (jobToSelect) {
          setSelectedJob(jobToSelect)
          if (jobToSelect.selected_candidates && jobToSelect.selected_candidates.length > 0) {
            setSelectedCandidate(jobToSelect.selected_candidates[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const initiateConversation = async (applicationId: string) => {
    try {
      setInitiatingChat(true)
      const response = await interviewAPI.getOrCreateConversation(applicationId)
      setConversationId(response.data.conversation.id)
      // Mark this candidate as having a conversation initiated
      setInitiatedConversations(prev => new Set(prev).add(applicationId))
    } catch (error) {
      console.error('Failed to initiate conversation:', error)
    } finally {
      setInitiatingChat(false)
    }
  }

  const handleRejectCandidate = async () => {
    if (!selectedCandidate) return
    
    const confirmed = window.confirm(
      `Are you sure you want to reject ${selectedCandidate.candidate.profile.full_name}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setRejectingCandidate(true)
      await applicationsAPI.updateApplicationStatus(selectedCandidate.id, 'rejected')
      
      // Remove the candidate from the list
      if (selectedJob) {
        setSelectedJob({
          ...selectedJob,
          selected_candidates: selectedJob.selected_candidates?.filter(c => c.id !== selectedCandidate.id) || []
        })
      }
      
      // Select the next candidate or clear selection
      if (selectedJob?.selected_candidates && selectedJob.selected_candidates.length > 1) {
        const nextCandidate = selectedJob.selected_candidates.find(c => c.id !== selectedCandidate.id)
        if (nextCandidate) {
          setSelectedCandidate(nextCandidate)
        }
      } else {
        setSelectedCandidate(null)
        setConversationId(null)
      }
      
      alert(`${selectedCandidate.candidate.profile.full_name} has been rejected.`)
    } catch (error) {
      console.error('Failed to reject candidate:', error)
      alert('Failed to reject candidate. Please try again.')
    } finally {
      setRejectingCandidate(false)
    }
  }

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    
    // Check if conversation exists or was initiated in this session
    if (candidate.conversation && candidate.conversation.length > 0) {
      setConversationId(candidate.conversation[0].id)
    } else if (initiatedConversations.has(candidate.id)) {
      // Conversation was initiated but might not be in the data yet
      // Try to get it
      initiateConversation(candidate.id)
    } else {
      setConversationId(null)
    }
  }

  const handleViewDetails = (candidate: Candidate, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card selection
    setDetailsCandidate(candidate)
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#633ff3] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <RecruiterNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Fixed */}
        <div className="hidden lg:block w-64 border-r border-gray-200 bg-white overflow-hidden">
          <RecruiterSidebar />
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Fixed and Compact */}
          <div className="px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Interview Manager</h1>
            <p className="text-gray-600 text-xs">Connect with your shortlisted candidates</p>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-full flex flex-col">
              {jobs.length === 0 ? (
                <Card className="p-6 text-center bg-white border border-gray-200 m-4">
                  <div className="max-w-md mx-auto">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No Interviews Yet</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      You haven't moved any candidates to the interview stage yet.
                    </p>
                    <p className="text-xs text-gray-500">
                      Go to the Applications page and click "Move to Interview" on candidates you want to interview.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden px-3 py-3 gap-3">
                  {/* Job Selector - Compact */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex-shrink-0">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Job Position
                    </label>
                    <div className="relative">
                      <select
                        value={selectedJob?.id || ''}
                        onChange={(e) => {
                        const job = jobs.find(j => j.id === e.target.value)
                        if (job) {
                          setSelectedJob(job)
                          setSelectedCandidate(null)
                          setConversationId(null)
                        }
                      }}
                      className="w-full px-3 py-2 pr-8 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#633ff3] focus:border-transparent appearance-none cursor-pointer"
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.job_title} ({job.selected_candidates?.length || 0})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {selectedJob && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{selectedJob.department || 'General'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{selectedJob.job_type || 'Full-time'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{selectedJob.location || 'Remote'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Split View Layout */}
                {selectedJob && selectedJob.selected_candidates && selectedJob.selected_candidates.length > 0 ? (
                  <div className="flex-1 flex gap-3 min-h-0">
                    {/* Left Side - Candidates List - Scrollable Only */}
                    <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col flex-shrink-0">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">
                          Candidates ({selectedJob.selected_candidates?.length || 0})
                        </h2>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 p-3">
                        {selectedJob.selected_candidates.map((candidate) => (
                            <Card
                              key={candidate.id}
                              className={`bg-white border-2 transition-all cursor-pointer hover:shadow-md flex-shrink-0 p-3 ${
                                selectedCandidate?.id === candidate.id
                                  ? 'border-[#633ff3] shadow-md'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleCandidateSelect(candidate)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative flex-shrink-0">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#633ff3] to-[#7c5aff] flex items-center justify-center">
                                    {candidate.candidate.profile.profile_picture_url ? (
                                      <img 
                                        src={candidate.candidate.profile.profile_picture_url}
                                        alt={candidate.candidate.profile.full_name}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-lg font-bold text-white">
                                        {candidate.candidate.profile.full_name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  {candidate.conversation && candidate.conversation.length > 0 && 
                                   candidate.conversation[0].recruiter_unread_count > 0 && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        {candidate.conversation[0].recruiter_unread_count}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                                        {candidate.candidate.profile.full_name}
                                      </h3>
                                      <p className="text-xs text-gray-600 truncate">
                                        {candidate.candidate.current_job_title || candidate.candidate.headline || 'Candidate'}
                                      </p>
                                    </div>
                                    {/* View Details & Reject Buttons */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleViewDetails(candidate, e)}
                                        className="h-8 w-8 p-0 bg-gray-100 hover:bg-purple-100 hover:text-[#633ff3] text-gray-700 transition-colors rounded-md"
                                        title="View Full Profile"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (window.confirm(`Are you sure you want to reject ${candidate.candidate.profile.full_name}?`)) {
                                            setRejectingCandidate(true)
                                            applicationsAPI.updateApplicationStatus(candidate.id, 'rejected')
                                              .then(() => {
                                                if (selectedJob) {
                                                  setSelectedJob({
                                                    ...selectedJob,
                                                    selected_candidates: selectedJob.selected_candidates?.filter(c => c.id !== candidate.id) || []
                                                  })
                                                }
                                                if (selectedCandidate?.id === candidate.id) {
                                                  setSelectedCandidate(null)
                                                  setConversationId(null)
                                                }
                                              })
                                              .catch((err) => console.error('Failed to reject:', err))
                                              .finally(() => setRejectingCandidate(false))
                                          }
                                        }}
                                        disabled={rejectingCandidate}
                                        className="h-8 w-8 p-0 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-700 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Reject Candidate"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* AI Score Badge - Compact */}
                                  {candidate.ai_analysis_score !== null && candidate.ai_analysis_score !== undefined && (
                                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-100 mt-1">
                                      <span className="text-xs text-gray-600">Match</span>
                                      <span className={`text-sm font-bold ${getScoreColor(candidate.ai_analysis_score)}`}>
                                        {candidate.ai_analysis_score}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>

                    {/* Right Side - Chat Box - Narrower & Next to Candidates */}
                    <div className="w-96 bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col min-h-0">
                      {selectedCandidate ? (
                        <>
                          {/* Candidate Info Header - Compact */}
                          <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-[#633ff3] to-[#7c5aff] flex-shrink-0 rounded-t-2xl">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                                  {selectedCandidate.candidate.profile.profile_picture_url ? (
                                    <img 
                                      src={selectedCandidate.candidate.profile.profile_picture_url}
                                      alt={selectedCandidate.candidate.profile.full_name}
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold text-white">
                                      {selectedCandidate.candidate.profile.full_name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-xs text-white truncate">
                                    {selectedCandidate.candidate.profile.full_name}
                                  </h3>
                                  <p className="text-xs text-white/80 truncate">
                                    {selectedCandidate.candidate.current_job_title || selectedCandidate.candidate.headline}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                                  title="Call"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                                  title="Schedule"
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Contact Info - Single Line */}
                            <div className="flex items-center gap-3 text-xs text-white/90">
                              <div className="flex items-center gap-1 min-w-0">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{selectedCandidate.candidate.profile.email}</span>
                              </div>
                              {selectedCandidate.candidate.profile.phone_number && (
                                <>
                                  <span className="text-white/50">•</span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Phone className="h-3 w-3" />
                                    <span>{selectedCandidate.candidate.profile.phone_number}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Compact AI Score Badge - Inline */}
                            {selectedCandidate.ai_analysis_score !== null && selectedCandidate.ai_analysis_score !== undefined && (
                              <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-1 bg-white/10 backdrop-blur-sm rounded border border-white/20 w-fit">
                                <span className="text-xs font-medium text-white">AI:</span>
                                <span className="font-bold text-white text-xs">
                                  {selectedCandidate.ai_analysis_score}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chat Area */}
                          <div className="flex-1 overflow-hidden">
                            {conversationId ? (
                              <ChatBox
                                conversationId={conversationId}
                                isRecruiter={true}
                              />
                            ) : initiatingChat ? (
                              <div className="h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                  <div className="animate-spin h-12 w-12 border-4 border-[#633ff3] border-t-transparent rounded-full mx-auto mb-4"></div>
                                  <p className="text-gray-600 font-medium">Starting conversation...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-600 mb-4 font-medium">No conversation started yet</p>
                                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                                    Start a conversation with {selectedCandidate.candidate.profile.full_name.split(' ')[0]} to discuss the interview.
                                  </p>
                                  <Button
                                    onClick={() => initiateConversation(selectedCandidate.id)}
                                    className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                                    disabled={initiatingChat}
                                  >
                                    {initiatingChat ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Starting...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Start Conversation
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium mb-2">Select a candidate</p>
                            <p className="text-sm text-gray-500">
                              Choose a candidate from the list to view details and chat
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedJob ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No candidates shortlisted for this position yet</p>
                    </div>
                  </div>
                ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && detailsCandidate && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="min-h-full flex items-center justify-center py-8">
            <Card 
              className="bg-white w-full max-w-3xl shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#633ff3] to-[#7c5aff] p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                      {detailsCandidate.candidate.profile.profile_picture_url ? (
                        <img 
                          src={detailsCandidate.candidate.profile.profile_picture_url}
                          alt={detailsCandidate.candidate.profile.full_name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {detailsCandidate.candidate.profile.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-white truncate">
                        {detailsCandidate.candidate.profile.full_name}
                      </h2>
                      <p className="text-white/90 mt-1 text-sm">
                        {detailsCandidate.candidate.current_job_title || detailsCandidate.candidate.headline}
                      </p>
                      {detailsCandidate.candidate.current_company && (
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-white/80" />
                          <span className="text-sm text-white/80">{detailsCandidate.candidate.current_company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* AI Score */}
                {detailsCandidate.ai_analysis_score !== null && detailsCandidate.ai_analysis_score !== undefined && (
                  <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium text-white">AI Compatibility</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">
                          {detailsCandidate.ai_analysis_score}%
                        </span>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          {getFitLevelBadge(detailsCandidate.ai_analysis_score).text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="p-6 space-y-5">
              {/* Contact Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#633ff3]" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                    <p className="text-gray-900">{detailsCandidate.candidate.profile.email}</p>
                  </div>
                  {detailsCandidate.candidate.profile.phone_number && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                      <p className="text-gray-900">{detailsCandidate.candidate.profile.phone_number}</p>
                    </div>
                  )}
                  {detailsCandidate.candidate.city && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Location</label>
                      <p className="text-gray-900">
                        {detailsCandidate.candidate.city}
                        {detailsCandidate.candidate.country && `, ${detailsCandidate.candidate.country}`}
                      </p>
                    </div>
                  )}
                  {detailsCandidate.candidate.years_of_experience && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Experience</label>
                      <p className="text-gray-900">{detailsCandidate.candidate.years_of_experience} years</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {detailsCandidate.candidate.bio && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed p-3 bg-gray-50 rounded-lg">
                    {detailsCandidate.candidate.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {detailsCandidate.candidate.skills && detailsCandidate.candidate.skills.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#633ff3]" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detailsCandidate.candidate.skills.map((skill, index) => (
                      <Badge 
                        key={index}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 text-xs"
                      >
                        {skill.skill_name}
                        {skill.skill_level && (
                          <span className="ml-1.5 opacity-75">• {skill.skill_level}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {detailsCandidate.candidate.experience && detailsCandidate.candidate.experience.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#633ff3]" />
                    Work Experience
                  </h3>
                  <div className="space-y-3">
                    {detailsCandidate.candidate.experience.map((exp, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{exp.job_title}</h4>
                            <p className="text-gray-600 text-sm">{exp.company}</p>
                          </div>
                          {exp.is_current && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {detailsCandidate.candidate.education && detailsCandidate.candidate.education.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#633ff3]" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {detailsCandidate.candidate.education.map((edu, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{edu.degree}</h4>
                            <p className="text-gray-600 text-sm">{edu.field_of_study}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{edu.institution}</p>
                          </div>
                          {edu.is_current && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Pursuing</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {edu.is_current ? 'Present' : new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Details */}
              {detailsCandidate.ai_analysis_data && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#633ff3]" />
                    AI Analysis Insights
                  </h3>
                  <div className="space-y-3">
                    {detailsCandidate.ai_analysis_data.strengths && detailsCandidate.ai_analysis_data.strengths.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-1.5 text-sm">Strengths</h4>
                        <ul className="list-disc list-inside space-y-0.5 text-sm text-green-800">
                          {detailsCandidate.ai_analysis_data.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detailsCandidate.ai_analysis_data.skill_gaps && detailsCandidate.ai_analysis_data.skill_gaps.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-900 mb-1.5 text-sm">Skill Gaps</h4>
                        <ul className="list-disc list-inside space-y-0.5 text-sm text-yellow-800">
                          {detailsCandidate.ai_analysis_data.skill_gaps.map((gap, index) => (
                            <li key={index}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detailsCandidate.ai_analysis_data.recommendations && detailsCandidate.ai_analysis_data.recommendations.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-1.5 text-sm">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-0.5 text-sm text-blue-800">
                          {detailsCandidate.ai_analysis_data.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Applied on {new Date(detailsCandidate.applied_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {detailsCandidate.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
