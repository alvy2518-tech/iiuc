"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Clock, Play, ExternalLink, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"
import api from "@/lib/api"

interface Course {
  id: string
  title: string
  description: string
  platform: string
  duration: string
  level: string
  instructor: string
  videoUrl: string
  thumbnail: string
  skills: string[]
  playlistUrl?: string
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [interestedJobs, setInterestedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchInterestedJobs()
  }, [])

  const fetchInterestedJobs = async () => {
    try {
      setLoading(true)
      const response = await savedJobsAPI.getInterestedJobs()
      setInterestedJobs(response.data.interestedJobs || [])
    } catch (error) {
      console.error("Failed to fetch interested jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateCourses = async () => {
    if (interestedJobs.length === 0) {
      return
    }

    setGenerating(true)
    try {
      const allSkills: string[] = []
      interestedJobs.forEach((item: any) => {
        const job = item.jobs
        if (job.job_skills && Array.isArray(job.job_skills)) {
          job.job_skills.forEach((skill: any) => {
            if (skill.skill_name && !allSkills.includes(skill.skill_name)) {
              allSkills.push(skill.skill_name)
            }
          })
        }
      })

      const jobsData = interestedJobs.map((item: any) => ({
        title: item.jobs.job_title,
        skills: item.jobs.job_skills?.map((s: any) => s.skill_name) || [],
        description: item.jobs.job_description
      }))

      const response = await api.post("/ai/courses/generate", {
        skills: allSkills,
        jobs: jobsData
      })

      setCourses(response.data.courses || [])
    } catch (error) {
      console.error("Failed to generate courses:", error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <CommonNavbar />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Free Learning Courses</h1>
            <p className="text-sm text-gray-600 mt-1">
              Watch free video courses and tutorials based on your interested jobs
            </p>
          </div>

          {/* Interested Jobs Summary */}
          {interestedJobs.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-[#633ff3]/5 to-[#8b5cf6]/5 border-[#633ff3]/20">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-[#633ff3]" />
                    Your Interested Jobs ({interestedJobs.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Courses are curated based on skills required for these positions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestedJobs.map((item: any) => (
                    <Badge 
                      key={item.id} 
                      variant="secondary"
                      className="bg-white border border-[#633ff3]/20"
                    >
                      {item.jobs.job_title}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={generateCourses} 
                  disabled={generating}
                  className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading Free Courses...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Load Free Courses
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Courses Grid */}
          {courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" 
                  onClick={() => {
                    // Store courses in localStorage so the detail page can access them
                    localStorage.setItem('generated_courses', JSON.stringify(courses))
                    router.push(`/candidate/courses/${course.id}`)
                  }}
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#633ff3] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="border-[#633ff3]/30 text-[#633ff3]">
                          {course.platform}
                        </Badge>
                        <span className="text-gray-600">{course.instructor}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <Badge variant="secondary" className="text-xs bg-gray-100">
                          {course.level}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="text-xs border-gray-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {course.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            +{course.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <Button 
                        className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#633ff3] mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your learning path...</p>
            </div>
          )}

          {/* Empty States */}
          {!loading && interestedJobs.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#633ff3]/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-[#633ff3]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interested Jobs Yet</h3>
              <p className="text-sm text-gray-600 mb-6">
                Mark some jobs as interested to access personalized free learning courses
              </p>
              <Button
                onClick={() => router.push('/candidate/jobs')}
                className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
              >
                Browse Jobs
              </Button>
            </Card>
          )}

          {!loading && interestedJobs.length > 0 && courses.length === 0 && !generating && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#633ff3]/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-[#633ff3]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start Learning</h3>
              <p className="text-sm text-gray-600">
                Click the button above to load personalized free video courses
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
