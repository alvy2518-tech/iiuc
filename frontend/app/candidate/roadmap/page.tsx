"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  TrendingUp, 
  Book, 
  Clock, 
  Target, 
  ChevronRight, 
  CheckCircle,
  BookOpen,
  Award,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"
import { cn } from "@/lib/utils"

export default function LearningRoadmapPage() {
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await savedJobsAPI.getLearningRoadmap()
      setRoadmap(response.data.roadmap)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate roadmap")
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#633ff3] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Generating your personalized learning roadmap...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roadmap Available</h3>
            <p className="text-sm text-gray-600 mb-6">
              {error || "Add jobs to your interested list to generate a learning roadmap"}
            </p>
            <Button
              onClick={() => router.push('/candidate/interested-jobs')}
              className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
            >
              Go to Interested Jobs
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
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Roadmap</h1>
              <p className="text-base text-gray-600">
                AI-generated personalized learning path to achieve your career goals
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={fetchRoadmap}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 h-11 px-6"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Roadmap
              </Button>
              <Button
                onClick={() => router.push('/candidate/profile/skills')}
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6"
              >
                <Target className="h-4 w-4 mr-2" />
                Update My Skills
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview - Desktop Optimized Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-8 w-8 text-white" />
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{roadmap.total_skills_needed || 0}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Total Skills</div>
            <div className="text-xs text-white/80 mt-1">To master your goals</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-white" />
              <div className="text-2xl font-bold text-white">{roadmap.total_time_estimate?.split(' ')[0] || 'N/A'}</div>
            </div>
            <div className="text-sm font-semibold text-white">Time Estimate</div>
            <div className="text-xs text-white/80 mt-1">{roadmap.total_time_estimate?.split(' ').slice(1).join(' ') || 'Duration'}</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="h-8 w-8 text-white" />
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{roadmap.learning_phases?.length || 0}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Learning Phases</div>
            <div className="text-xs text-white/80 mt-1">Structured progression</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <Award className="h-8 w-8 text-white" />
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{roadmap.career_paths?.length || 0}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">Career Paths</div>
            <div className="text-xs text-white/80 mt-1">Opportunities ahead</div>
          </div>
        </div>

        {/* Skill Gap Analysis Section */}
        {roadmap.skill_gap_analysis && (
          <Card className="p-8 mb-10 bg-white border-l-4 border-orange-500 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gap Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* New Skills */}
                  {roadmap.skill_gap_analysis.new_skills_needed && roadmap.skill_gap_analysis.new_skills_needed.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        New Skills Needed ({roadmap.skill_gap_analysis.new_skills_needed.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.skill_gap_analysis.new_skills_needed.map((skill: string, idx: number) => (
                          <Badge key={idx} className="bg-red-600 text-white border-0">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills to Upgrade */}
                  {roadmap.skill_gap_analysis.skills_to_upgrade && roadmap.skill_gap_analysis.skills_to_upgrade.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Skills to Upgrade ({roadmap.skill_gap_analysis.skills_to_upgrade.length})
                      </h4>
                      <div className="space-y-2">
                        {roadmap.skill_gap_analysis.skills_to_upgrade.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-semibold">{item.skill}:</span>{' '}
                            <span className="text-yellow-700">{item.current_level}</span>{' '}
                            <span className="text-gray-500">→</span>{' '}
                            <span className="text-green-700 font-medium">{item.target_level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills Already Sufficient */}
                  {roadmap.skill_gap_analysis.skills_already_sufficient && roadmap.skill_gap_analysis.skills_already_sufficient.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Sufficient ({roadmap.skill_gap_analysis.skills_already_sufficient.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.skill_gap_analysis.skills_already_sufficient.map((skill: string, idx: number) => (
                          <Badge key={idx} className="bg-green-600 text-white border-0">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Section */}
        {roadmap.summary && (
          <Card className="p-8 mb-10 bg-white border-l-4 border-blue-600 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Roadmap Overview</h3>
                <p className="text-base text-gray-700 leading-relaxed">{roadmap.summary}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Career Paths - Desktop Grid Layout */}
        {roadmap.career_paths && roadmap.career_paths.length > 0 && (
          <Card className="p-8 mb-10 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mr-4">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Career Opportunities</h2>
                <p className="text-sm text-gray-600">Potential roles you can pursue</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {roadmap.career_paths.map((path: any, index: number) => (
                <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      {path.readiness_percentage || 'N/A'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">{path.role}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Phases: </span>
                      <span className="ml-1">{path.required_phases?.join(', ') || 'All'}</span>
                    </div>
                    {path.job_titles && path.job_titles.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs font-semibold text-gray-500 block mb-2">Related Positions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {path.job_titles.slice(0, 3).map((title: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{title}</Badge>
                          ))}
                          {path.job_titles.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{path.job_titles.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Learning Phases - Desktop Optimized Timeline */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Learning Phases</h2>
              <p className="text-sm text-gray-600">Your step-by-step progression path</p>
            </div>
          </div>

          {roadmap.learning_phases && roadmap.learning_phases.map((phase: any, phaseIndex: number) => (
            <div key={phase.phase} className="relative">
              {/* Connector Line */}
              {phaseIndex < roadmap.learning_phases.length - 1 && (
                <div className="absolute left-12 top-full h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 z-0 rounded-full"></div>
              )}

              <Card className="relative z-10 overflow-hidden shadow-xl border-2 border-gray-200 hover:border-blue-500 transition-all">
                {/* Phase Header - Desktop Optimized */}
                <div className="p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl shadow-lg">
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{phase.title}</h3>
                        <p className="text-base text-gray-700 leading-relaxed max-w-3xl">{phase.description}</p>
                        {phase.prerequisites && phase.prerequisites.length > 0 && (
                          <div className="mt-3 flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg inline-flex">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-medium">Prerequisites:</span>
                            <span className="ml-2">{phase.prerequisites.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-4 py-2 border-0 shadow-lg">
                        <Clock className="h-4 w-4 mr-2 inline" />
                        {phase.duration}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Skills in Phase - Desktop 3-Column Grid */}
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {phase.skills && phase.skills.map((skill: any, skillIndex: number) => (
                      <Card key={skillIndex} className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group">
                        <div className="space-y-4">
                          {/* Skill Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{skill.skill}</h4>
                          </div>

                          {/* Skill Type and Level Progress */}
                          {skill.skill_type && (
                            <div className="space-y-2">
                              <Badge 
                                className={cn(
                                  "text-xs font-medium",
                                  skill.skill_type === 'new' 
                                    ? "bg-red-100 text-red-700 border-red-300" 
                                    : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                )}
                              >
                                {skill.skill_type === 'new' ? '🆕 New Skill' : '⬆️ Upgrade'}
                              </Badge>
                              {skill.skill_type === 'upgrade' && skill.current_level && skill.target_level && (
                                <div className="text-xs bg-gradient-to-r from-yellow-50 to-green-50 p-2 rounded border border-yellow-200">
                                  <span className="font-semibold text-gray-700">Level:</span>{' '}
                                  <span className="text-yellow-700">{skill.current_level}</span>{' '}
                                  <span className="text-gray-500">→</span>{' '}
                                  <span className="text-green-700 font-semibold">{skill.target_level}</span>
                                </div>
                              )}
                              {skill.skill_type === 'new' && skill.target_level && (
                                <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                                  <span className="font-semibold text-gray-700">Target:</span>{' '}
                                  <span className="text-blue-700 font-semibold">{skill.target_level}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Gap Addressed */}
                          {skill.gap_addressed && (
                            <div className="text-xs bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <span className="font-semibold text-orange-900">Gap: </span>
                              <span className="text-gray-700">{skill.gap_addressed}</span>
                            </div>
                          )}

                          {/* Skill Category, Difficulty, and Time */}
                          <div className="flex items-center flex-wrap gap-2 text-sm">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{skill.category}</Badge>
                            <Badge className={cn("text-xs", getDifficultyColor(skill.difficulty))}>
                              📚 {skill.difficulty}
                            </Badge>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs font-medium">{skill.time_estimate}</span>
                            </div>
                          </div>

                          {/* Learning Path */}
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {skill.learning_path}
                          </p>

                          {/* Resources */}
                          {skill.resources && skill.resources.length > 0 && (
                            <div className="pt-3 border-t border-gray-200">
                              <span className="text-xs font-semibold text-gray-500 block mb-2">
                                Resources:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {skill.resources.slice(0, 3).map((resource: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    {resource}
                                  </Badge>
                                ))}
                                {skill.resources.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">+{skill.resources.length - 3}</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Unlocks */}
                          {skill.unlocks && skill.unlocks.length > 0 && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex items-start text-xs bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                                <ArrowRight className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-700">Unlocks:</span>
                                  <span className="ml-1 text-gray-600">{skill.unlocks.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom Actions - Desktop Layout */}
        <Card className="p-6 mt-10 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to start your journey?</h3>
              <p className="text-sm text-gray-600">Update your profile or manage your career interests</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/candidate/interested-jobs')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Interested Jobs
              </Button>
              <Button
                onClick={() => router.push('/candidate/courses')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

