"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecruiterNavbar } from '@/components/recruiter-navbar'
import { RecruiterSidebar } from '@/components/recruiter-sidebar'
import { ChatBox } from '@/components/chat-box'
import { 
  Inbox as InboxIcon,
  MessageSquare, 
  Briefcase,
  Building2,
  Clock,
  User,
  Sparkles
} from 'lucide-react'
import { interviewAPI } from '@/lib/api'

interface Conversation {
  id: string
  is_initiated: boolean
  last_message_at: string
  last_message_content: string | null
  recruiter_unread_count: number
  candidate: {
    id: string
    user_id: string
    current_job_title: string
    current_company: string
    profile: {
      full_name: string
      email: string
      profile_picture_url: string
    }
  }
  application: {
    id: string
    ai_analysis_score: number | null
  }
  job: {
    id: string
    job_title: string
    department: string
  }
}

interface Job {
  id: string
  job_title: string
  department: string
  conversations: Conversation[]
}

export default function RecruiterInboxPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [allConversations, setAllConversations] = useState<Conversation[]>([])

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await interviewAPI.getRecruiterInterviews()
      
      // Extract all conversations from jobs
      const jobsData = response.data.jobs || []
      setJobs(jobsData)
      
      // Flatten all conversations with job context
      const allConvs: Conversation[] = []
      jobsData.forEach((job: any) => {
        if (job.selected_candidates) {
          job.selected_candidates.forEach((candidate: any) => {
            if (candidate.conversation && candidate.conversation.length > 0) {
              const conv = candidate.conversation[0]
              allConvs.push({
                ...conv,
                candidate: candidate.candidate,
                application: {
                  id: candidate.id,
                  ai_analysis_score: candidate.ai_analysis_score
                },
                job: {
                  id: job.id,
                  job_title: job.job_title,
                  department: job.department
                }
              })
            }
          })
        }
      })
      
      // Sort by last message time
      allConvs.sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return dateB - dateA
      })
      
      setAllConversations(allConvs)
      
      // Auto-select first conversation if exists
      if (allConvs.length > 0 && !selectedConversation) {
        setSelectedConversation(allConvs[0])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400'
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-9 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-[#633ff3] border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading messages...</p>
              </div>
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
          {/* Left Sidebar */}
          <RecruiterSidebar />

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <InboxIcon className="h-7 w-7 text-[#633ff3]" />
                Messages
              </h1>
              <p className="text-gray-600 mt-1">Chat with shortlisted candidates</p>
            </div>

            {allConversations.length === 0 ? (
              <Card className="p-12 text-center bg-white border border-gray-200">
                <div className="max-w-md mx-auto">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
                  <p className="text-gray-600 mb-4">
                    When you move candidates to the interview stage, you'll be able to chat with them here.
                  </p>
                  <p className="text-sm text-gray-500">
                    Go to Applications and shortlist candidates to start conversations
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <div className="lg:col-span-1">
                  <Card className="bg-white border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-4">
                      Conversations ({allConversations.length})
                    </h2>
                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {allConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            selectedConversation?.id === conversation.id
                              ? 'border-[#633ff3] bg-purple-50'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#633ff3] to-[#7c5aff] flex items-center justify-center">
                                {conversation.candidate.profile.profile_picture_url ? (
                                  <img 
                                    src={conversation.candidate.profile.profile_picture_url}
                                    alt={conversation.candidate.profile.full_name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-white">
                                    {conversation.candidate.profile.full_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              {conversation.recruiter_unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    {conversation.recruiter_unread_count}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm text-gray-900 truncate">
                                  {conversation.candidate.profile.full_name}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {formatTime(conversation.last_message_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">
                                {conversation.job.job_title}
                              </p>
                              {conversation.application.ai_analysis_score !== null && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Sparkles className="h-3 w-3 text-[#633ff3]" />
                                  <span className={`text-xs font-bold ${getScoreColor(conversation.application.ai_analysis_score)}`}>
                                    {conversation.application.ai_analysis_score}%
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.last_message_content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <Card className="bg-white border border-gray-200 h-[calc(100vh-280px)] flex flex-col">
                      {/* Chat Header */}
                      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#633ff3] to-[#7c5aff]">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                            {selectedConversation.candidate.profile.profile_picture_url ? (
                              <img 
                                src={selectedConversation.candidate.profile.profile_picture_url}
                                alt={selectedConversation.candidate.profile.full_name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-white">
                                {selectedConversation.candidate.profile.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg text-white">
                                {selectedConversation.candidate.profile.full_name}
                              </h3>
                              {selectedConversation.application.ai_analysis_score !== null && (
                                <Badge className="bg-white/20 text-white border-white/30 text-xs flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {selectedConversation.application.ai_analysis_score}% Match
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>{selectedConversation.job.job_title}</span>
                            </div>
                            {selectedConversation.candidate.current_job_title && (
                              <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                                <Building2 className="h-3 w-3" />
                                <span>
                                  {selectedConversation.candidate.current_job_title}
                                  {selectedConversation.candidate.current_company && ` at ${selectedConversation.candidate.current_company}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chat Box */}
                      <div className="flex-1 overflow-hidden">
                        <ChatBox
                          conversationId={selectedConversation.id}
                          isRecruiter={true}
                        />
                      </div>
                    </Card>
                  ) : (
                    <Card className="bg-white border border-gray-200 h-[calc(100vh-280px)] flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">Select a conversation</p>
                        <p className="text-sm text-gray-500">
                          Choose a candidate from the list to start chatting
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
