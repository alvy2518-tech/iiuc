"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  PlusCircle, 
  Trash2,
  Youtube,
  TrendingUp,
  Target,
  Award
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { coursesAPI, savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  skill_name: string
  skill_level: string
  phase_number: number
  youtube_video_id: string
  video_title: string
  video_description: string
  thumbnail_url: string
  channel_name: string
  duration: string
  is_watched: boolean
  watched_at: string | null
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingCourse, setAddingCourse] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, roadmapRes] = await Promise.all([
        coursesAPI.getMyCourses(),
        savedJobsAPI.getLearningRoadmap()
      ])
      
      setCourses(coursesRes.data.courses || [])
      setRoadmap(roadmapRes.data.roadmap)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (skillName: string, skillLevel: string, phaseNumber: number) => {
    try {
      setAddingCourse(`${skillName}-${skillLevel}`)
      const response = await coursesAPI.addCourse({ skillName, skillLevel, phaseNumber })
      setCourses([...courses, response.data.course])
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add course")
    } finally {
      setAddingCourse(null)
    }
  }

  const handleToggleWatch = async (courseId: string, currentStatus: boolean) => {
    try {
      await coursesAPI.updateWatchStatus(courseId, !currentStatus)
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, is_watched: !currentStatus, watched_at: !currentStatus ? new Date().toISOString() : null } : c
      ))
    } catch (error) {
      console.error("Failed to update watch status:", error)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return
    
    try {
      await coursesAPI.deleteCourse(courseId)
      setCourses(courses.filter(c => c.id !== courseId))
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const getCourseForSkill = (skillName: string) => {
    return courses.find(c => c.skill_name === skillName)
  }

  const getPhaseProgress = (phaseSkills: any[]) => {
    const skillsWithCourses = phaseSkills.filter(skill => getCourseForSkill(skill.skill))
    const watchedCourses = skillsWithCourses.filter(skill => {
      const course = getCourseForSkill(skill.skill)
      return course?.is_watched
    })
    return {
      total: phaseSkills.length,
      withCourses: skillsWithCourses.length,
      watched: watchedCourses.length
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#633ff3] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background">
        <CommonNavbar />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Roadmap</h3>
            <p className="text-sm text-gray-600 mb-6">
              Create a learning roadmap by adding jobs to your interested list
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
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Courses</h1>
              <p className="text-base text-gray-600">
                Curated video courses for each skill in your roadmap
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/candidate/roadmap')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Target className="h-4 w-4 mr-2" />
              View Roadmap
            </Button>
          </div>
        </div>

        {/* Learning Phases */}
        <div className="space-y-8">
          {roadmap.learning_phases && roadmap.learning_phases.map((phase: any, phaseIndex: number) => {
            const progress = getPhaseProgress(phase.skills || [])
            
            return (
              <div key={phase.phase} className="relative">
                {/* Connector Line */}
                {phaseIndex < roadmap.learning_phases.length - 1 && (
                  <div className="absolute left-12 top-full h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 z-0 rounded-full"></div>
                )}

                <Card className="relative z-10 overflow-hidden shadow-xl border-2 border-gray-200">
                  {/* Phase Header */}
                  <div className="p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl shadow-lg">
                          {phase.phase}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-bold text-gray-900 mb-2">{phase.title}</h3>
                          <p className="text-base text-gray-700">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-4 py-2 border-0 shadow-lg">
                          <Clock className="h-4 w-4 mr-2 inline" />
                          {phase.duration}
                        </Badge>
                        <div className="mt-2 text-sm text-gray-600">
                          {progress.watched}/{progress.total} courses watched
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills/Courses in Phase */}
                  <div className="p-8 bg-white">
                    <div className="space-y-4">
                      {phase.skills && phase.skills.map((skill: any, skillIndex: number) => {
                        const course = getCourseForSkill(skill.skill)
                        const courseKey = `${skill.skill}-${skill.skill_type === 'upgrade' ? skill.target_level : skill.skill_type === 'new' ? (skill.target_level || 'Intermediate') : 'Beginner'}`
                        
                        return (
                          <Card key={skillIndex} className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:shadow-xl transition-all">
                            <div className="space-y-4">
                              {/* Skill Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-xl text-gray-900">{skill.skill}</h4>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={skill.skill_type === 'new' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                                      {skill.skill_type === 'new' ? '🆕 New Skill' : '⬆️ Upgrade'}
                                    </Badge>
                                    {skill.skill_type === 'upgrade' && (
                                      <span className="text-sm text-gray-600">
                                        {skill.current_level} → {skill.target_level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {course ? (
                                  <Button
                                    size="sm"
                                    variant={course.is_watched ? "outline" : "default"}
                                    onClick={() => handleToggleWatch(course.id, course.is_watched)}
                                    className={course.is_watched ? "border-green-600 text-green-600" : "bg-blue-600 hover:bg-blue-700 text-white"}
                                  >
                                    {course.is_watched ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Watched
                                      </>
                                    ) : (
                                      <>
                                        Mark Watched
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddCourse(
                                      skill.skill,
                                      skill.skill_type === 'upgrade' ? skill.target_level : (skill.target_level || 'Intermediate'),
                                      phase.phase
                                    )}
                                    disabled={addingCourse === courseKey}
                                    className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                                  >
                                    {addingCourse === courseKey ? (
                                      <>Loading...</>
                                    ) : (
                                      <>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Course
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>

                              {/* Course Content */}
                              {course ? (
                                <div className="border-t pt-4">
                                  <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <img
                                      src={course.thumbnail_url}
                                      alt={course.video_title}
                                      className="w-48 h-28 object-cover rounded-lg"
                                    />
                                    
                                    {/* Details */}
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900 mb-2">{course.video_title}</h5>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                          <Youtube className="h-4 w-4 mr-1 text-red-600" />
                                          {course.channel_name}
                                        </span>
                                        <span className="flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          {course.duration}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            // Store course data for detail page
                                            const courseData = {
                                              id: course.id,
                                              title: course.video_title,
                                              description: course.video_description || `Learn ${course.skill_name} at ${course.skill_level} level`,
                                              platform: 'YouTube',
                                              duration: course.duration,
                                              level: course.skill_level,
                                              instructor: course.channel_name,
                                              videoUrl: `https://www.youtube.com/watch?v=${course.youtube_video_id}`,
                                              thumbnail: course.thumbnail_url,
                                              skills: [course.skill_name]
                                            }
                                            localStorage.setItem('current_course', JSON.stringify(courseData))
                                            router.push(`/candidate/courses/${course.id}`)
                                          }}
                                          className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                                        >
                                          <Play className="h-4 w-4 mr-2" />
                                          Watch Course
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteCourse(course.id)}
                                          className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-t pt-4">
                                  <p className="text-sm text-gray-600 italic">
                                    No course added yet. Click "Add Course" to find a video tutorial.
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <Card className="p-6 mt-10 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Keep Learning!</h3>
              <p className="text-sm text-gray-600">Track your progress and update your roadmap as you grow</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/candidate/profile/skills')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Award className="h-4 w-4 mr-2" />
                Update Skills
              </Button>
              <Button
                onClick={() => router.push('/candidate/roadmap')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Roadmap
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
