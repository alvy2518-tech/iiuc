"use client"

import { useEffect, useState, useRef } from "react"
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
  AlertCircle,
  Download,
  RefreshCw,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Calendar,
  BarChart3,
  Lightbulb,
  Code,
  Rocket
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { savedJobsAPI } from "@/lib/api"
import { CommonNavbar } from "@/components/common-navbar"
import { cn } from "@/lib/utils"

export default function LearningRoadmapPage() {
  const router = useRouter()
  const roadmapRef = useRef<HTMLDivElement>(null)
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

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

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('programming') || cat.includes('language')) return Code;
    if (cat.includes('framework') || cat.includes('library')) return Lightbulb;
    if (cat.includes('tool') || cat.includes('devops')) return Rocket;
    if (cat.includes('database')) return BarChart3;
    return Book;
  }

  const downloadAsText = () => {
    if (!roadmap) return;

    let content = `
╔════════════════════════════════════════════════════════════════╗
║              PERSONALIZED LEARNING ROADMAP                      ║
║              Generated on ${new Date().toLocaleDateString()}                        ║
╚════════════════════════════════════════════════════════════════╝

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════
${roadmap.summary || 'No summary available'}

ROADMAP OVERVIEW
═══════════════════════════════════════════════════════════════════
→ Total Skills Required: ${roadmap.total_skills_needed || 0}
→ Estimated Duration: ${roadmap.total_time_estimate || 'Not specified'}
→ Learning Phases: ${roadmap.learning_phases?.length || 0}
→ Career Paths Available: ${roadmap.career_paths?.length || 0}

`;

    // Skill Gap Analysis
    if (roadmap.skill_gap_analysis) {
      content += `\nSKILL GAP ANALYSIS
═══════════════════════════════════════════════════════════════════\n`;
      
      if (roadmap.skill_gap_analysis.new_skills_needed?.length > 0) {
        content += `\n📌 NEW SKILLS TO LEARN (${roadmap.skill_gap_analysis.new_skills_needed.length}):\n`;
        roadmap.skill_gap_analysis.new_skills_needed.forEach((skill: string, idx: number) => {
          content += `   ${idx + 1}. ${skill}\n`;
        });
      }

      if (roadmap.skill_gap_analysis.skills_to_upgrade?.length > 0) {
        content += `\n📈 SKILLS TO UPGRADE (${roadmap.skill_gap_analysis.skills_to_upgrade.length}):\n`;
        roadmap.skill_gap_analysis.skills_to_upgrade.forEach((item: any, idx: number) => {
          content += `   ${idx + 1}. ${item.skill}: ${item.current_level} → ${item.target_level}\n`;
        });
      }

      if (roadmap.skill_gap_analysis.skills_already_sufficient?.length > 0) {
        content += `\n✓ SKILLS ALREADY SUFFICIENT (${roadmap.skill_gap_analysis.skills_already_sufficient.length}):\n`;
        roadmap.skill_gap_analysis.skills_already_sufficient.forEach((skill: string, idx: number) => {
          content += `   ${idx + 1}. ${skill}\n`;
        });
      }
    }

    // Career Paths
    if (roadmap.career_paths?.length > 0) {
      content += `\n\nCAREER OPPORTUNITIES
═══════════════════════════════════════════════════════════════════\n`;
      roadmap.career_paths.forEach((path: any, idx: number) => {
        content += `\n${idx + 1}. ${path.role}\n`;
        content += `   Readiness: ${path.readiness_percentage || 'N/A'}\n`;
        content += `   Required Phases: ${path.required_phases?.join(', ') || 'All phases'}\n`;
        if (path.job_titles?.length > 0) {
          content += `   Related Positions: ${path.job_titles.join(', ')}\n`;
        }
      });
    }

    // Learning Phases
    if (roadmap.learning_phases?.length > 0) {
      content += `\n\nLEARNING PHASES - DETAILED BREAKDOWN
═══════════════════════════════════════════════════════════════════\n`;
      
      roadmap.learning_phases.forEach((phase: any) => {
        content += `\n${'═'.repeat(67)}\n`;
        content += `PHASE ${phase.phase}: ${phase.title.toUpperCase()}\n`;
        content += `${'═'.repeat(67)}\n`;
        content += `Duration: ${phase.duration}\n`;
        content += `Description: ${phase.description}\n`;
        
        if (phase.prerequisites?.length > 0) {
          content += `Prerequisites: ${phase.prerequisites.join(', ')}\n`;
        }

        content += `\nSkills in this Phase:\n`;
        content += `${'-'.repeat(67)}\n`;

        phase.skills?.forEach((skill: any, skillIdx: number) => {
          content += `\n${skillIdx + 1}. ${skill.skill}\n`;
          content += `   ├─ Type: ${skill.skill_type === 'new' ? 'New Skill' : 'Upgrade Existing'}\n`;
          content += `   ├─ Category: ${skill.category}\n`;
          content += `   ├─ Difficulty: ${skill.difficulty}\n`;
          content += `   ├─ Time Required: ${skill.time_estimate}\n`;
          
          if (skill.skill_type === 'upgrade') {
            content += `   ├─ Current Level: ${skill.current_level}\n`;
            content += `   ├─ Target Level: ${skill.target_level}\n`;
          } else {
            content += `   ├─ Target Level: ${skill.target_level}\n`;
          }

          if (skill.gap_addressed) {
            content += `   ├─ Addresses: ${skill.gap_addressed}\n`;
          }

          content += `   ├─ Learning Path:\n`;
          content += `   │  ${skill.learning_path}\n`;

          if (skill.resources?.length > 0) {
            content += `   ├─ Recommended Resources:\n`;
            skill.resources.forEach((resource: string) => {
              content += `   │  • ${resource}\n`;
            });
          }

          if (skill.unlocks?.length > 0) {
            content += `   └─ Unlocks: ${skill.unlocks.join(', ')}\n`;
          } else {
            content += `   └─ (No prerequisites for other skills)\n`;
          }
        });
      });
    }

    // When to Apply
    content += `\n\n${'═'.repeat(67)}\n`;
    content += `WHEN TO START APPLYING FOR JOBS/INTERNSHIPS\n`;
    content += `${'═'.repeat(67)}\n`;
    content += `\nRECOMMENDED APPLICATION TIMELINE:\n\n`;
    
    if (roadmap.learning_phases?.length > 0) {
      const midPoint = Math.ceil(roadmap.learning_phases.length / 2);
      content += `→ After completing Phase ${midPoint}: Begin looking for internships\n`;
      content += `  (You'll have foundational skills and be ready for entry-level positions)\n\n`;
      content += `→ After completing Phase ${roadmap.learning_phases.length - 1}: Apply for junior positions\n`;
      content += `  (You'll have most required skills with good confidence)\n\n`;
      content += `→ After completing all phases: Target mid-level and specialized roles\n`;
      content += `  (You'll have comprehensive skills for competitive positions)\n\n`;
    }

    content += `\nPROJECT IDEAS TO BUILD YOUR PORTFOLIO:\n`;
    content += `${'-'.repeat(67)}\n`;
    
    if (roadmap.learning_phases?.length > 0) {
      roadmap.learning_phases.forEach((phase: any, idx: number) => {
        content += `\nPhase ${phase.phase} Projects:\n`;
        const phaseSkills = phase.skills?.slice(0, 3).map((s: any) => s.skill).join(', ') || 'various technologies';
        
        if (idx === 0) {
          content += `  • Build a personal portfolio website\n`;
          content += `  • Create a todo list application\n`;
          content += `  • Develop a simple calculator or converter tool\n`;
        } else if (idx === 1) {
          content += `  • Build a full-stack blog or social media clone\n`;
          content += `  • Create an e-commerce product catalog\n`;
          content += `  • Develop a REST API with authentication\n`;
        } else {
          content += `  • Build a real-time chat application\n`;
          content += `  • Create a dashboard with data visualization\n`;
          content += `  • Develop a mobile app or progressive web app\n`;
        }
        content += `  (Using: ${phaseSkills})\n`;
      });
    }

    content += `\n\n${'═'.repeat(67)}\n`;
    content += `Generated by IIUC Career Platform\n`;
    content += `This roadmap is personalized based on your profile and career goals.\n`;
    content += `${'═'.repeat(67)}\n`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-roadmap-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      downloadAsText();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
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
    <div className="min-h-screen bg-white">
      <CommonNavbar />

      <main ref={roadmapRef} className="max-w-[1400px] mx-auto px-12 py-10">
        {/* Professional Header */}
        <div className="mb-12 border-b pb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Personalized Learning Roadmap</h1>
                  <p className="text-sm text-gray-500 mt-1">AI-Generated Career Development Plan</p>
                </div>
              </div>
              <p className="text-base text-gray-600 max-w-3xl leading-relaxed">
                Your customized learning path based on career goals, current skills, and target positions. 
                Follow this structured plan to systematically acquire the competencies required for your desired roles.
              </p>
            </div>
            <div className="flex flex-col space-y-3 ml-8">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-11 px-6"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Preparing...' : 'Download Roadmap'}
              </Button>
              <Button
                variant="outline"
                onClick={fetchRoadmap}
                className="border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 h-11 px-6"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">{roadmap.total_skills_needed || 0}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Total Skills</h3>
            <p className="text-xs text-gray-500">Required competencies</p>
          </Card>

          <Card className="p-6 border-2 border-gray-200 hover:border-purple-500 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">
                {roadmap.total_time_estimate?.split('-')[0] || 'N/A'}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Duration</h3>
            <p className="text-xs text-gray-500">{roadmap.total_time_estimate || 'Estimated time'}</p>
          </Card>

          <Card className="p-6 border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">{roadmap.learning_phases?.length || 0}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Learning Phases</h3>
            <p className="text-xs text-gray-500">Structured modules</p>
          </Card>

          <Card className="p-6 border-2 border-gray-200 hover:border-orange-500 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-orange-600">{roadmap.career_paths?.length || 0}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Career Paths</h3>
            <p className="text-xs text-gray-500">Target positions</p>
          </Card>
        </div>

        {/* Executive Summary */}
        {roadmap.summary && (
          <Card className="mb-12 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="p-8">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Book className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Executive Summary</h2>
                  <p className="text-base text-gray-700 leading-relaxed">{roadmap.summary}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Skill Gap Analysis */}
        {roadmap.skill_gap_analysis && (
          <Card className="mb-12 border-2 border-orange-200">
            <div className="bg-gradient-to-r from-orange-50 to-white p-8 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Skill Gap Analysis</h2>
                  <p className="text-sm text-gray-600">Current state vs. target requirements</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                {/* New Skills */}
                {roadmap.skill_gap_analysis.new_skills_needed && roadmap.skill_gap_analysis.new_skills_needed.length > 0 && (
                  <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h3 className="text-base font-bold text-red-900">
                        New Skills Needed ({roadmap.skill_gap_analysis.new_skills_needed.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {roadmap.skill_gap_analysis.new_skills_needed.map((skill: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills to Upgrade */}
                {roadmap.skill_gap_analysis.skills_to_upgrade && roadmap.skill_gap_analysis.skills_to_upgrade.length > 0 && (
                  <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-base font-bold text-yellow-900">
                        Skills to Upgrade ({roadmap.skill_gap_analysis.skills_to_upgrade.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {roadmap.skill_gap_analysis.skills_to_upgrade.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm bg-white rounded p-2 border border-yellow-200">
                          <div className="font-semibold text-gray-900 mb-1">{item.skill}</div>
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="text-yellow-700">{item.current_level}</span>
                            <ArrowRight className="h-3 w-3 mx-2" />
                            <span className="text-green-700 font-semibold">{item.target_level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills Already Sufficient */}
                {roadmap.skill_gap_analysis.skills_already_sufficient && roadmap.skill_gap_analysis.skills_already_sufficient.length > 0 && (
                  <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="text-base font-bold text-green-900">
                        Already Sufficient ({roadmap.skill_gap_analysis.skills_already_sufficient.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {roadmap.skill_gap_analysis.skills_already_sufficient.map((skill: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}


        {/* Career Opportunities */}
        {roadmap.career_paths && roadmap.career_paths.length > 0 && (
          <Card className="mb-12 border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-50 to-white p-8 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Career Opportunities</h2>
                  <p className="text-sm text-gray-600">Target positions aligned with your learning path</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {roadmap.career_paths.map((path: any, index: number) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition-all bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-3 py-1">
                        {path.readiness_percentage || 'N/A'}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4">{path.role}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 font-medium">Required Phases:</span>
                          <span className="ml-2 text-gray-700">{path.required_phases?.join(', ') || 'All'}</span>
                        </div>
                      </div>
                      {path.job_titles && path.job_titles.length > 0 && (
                        <div className="pt-3 border-t">
                          <span className="text-xs font-semibold text-gray-500 block mb-2">Related Positions:</span>
                          <div className="space-y-1.5">
                            {path.job_titles.map((title: string, idx: number) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs text-gray-700">
                                <ChevronRight className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span>{title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* When to Apply Section */}
        <Card className="mb-12 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <div className="p-8">
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">When to Start Applying</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-green-200 rounded-lg p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-700">1</span>
                      </div>
                      <h3 className="font-bold text-gray-900">Internships</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">After Phase {Math.ceil((roadmap.learning_phases?.length || 2) / 2)}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Once you have foundational skills, start applying for internships to gain practical experience
                    </p>
                  </div>

                  <div className="bg-white border-2 border-green-200 rounded-lg p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700">2</span>
                      </div>
                      <h3 className="font-bold text-gray-900">Junior Roles</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">After Phase {(roadmap.learning_phases?.length || 3) - 1}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      With most skills acquired, target junior developer positions for full-time opportunities
                    </p>
                  </div>

                  <div className="bg-white border-2 border-green-200 rounded-lg p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">3</span>
                      </div>
                      <h3 className="font-bold text-gray-900">Mid-Level</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">After All Phases</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      With comprehensive skills and portfolio, apply for mid-level and specialized positions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Learning Phases */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detailed Learning Phases</h2>
                <p className="text-sm text-gray-600">Step-by-step progression with resources and projects</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {roadmap.learning_phases && roadmap.learning_phases.map((phase: any, phaseIndex: number) => {
              const IconComponent = getCategoryIcon('phase');
              
              return (
                <div key={phase.phase} className="relative">
                  {/* Timeline Connector */}
                  {phaseIndex < roadmap.learning_phases.length - 1 && (
                    <div className="absolute left-8 top-full h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 z-0"></div>
                  )}

                  <Card className="relative z-10 border-2 border-gray-200 overflow-hidden hover:border-blue-500 transition-all">
                    {/* Phase Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                            <span className="text-3xl font-bold">{phase.phase}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-2xl font-bold">{phase.title}</h3>
                              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                                <Clock className="h-3 w-3 mr-1 inline" />
                                {phase.duration}
                              </Badge>
                            </div>
                            <p className="text-blue-100 text-base leading-relaxed">{phase.description}</p>
                            {phase.prerequisites && phase.prerequisites.length > 0 && (
                              <div className="mt-3 flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex border border-white/20">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span className="text-sm">Prerequisites: {phase.prerequisites.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-blue-100 mb-1">Phase {phase.phase} of {roadmap.learning_phases.length}</div>
                          <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full" 
                              style={{ width: `${(phase.phase / roadmap.learning_phases.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Grid */}
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {phase.skills && phase.skills.map((skill: any, skillIndex: number) => {
                          const SkillIcon = getCategoryIcon(skill.category);
                          
                          return (
                            <Card key={skillIndex} className="p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all bg-white">
                              <div className="space-y-4">
                                {/* Skill Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <SkillIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-lg text-gray-900 leading-tight mb-1">{skill.skill}</h4>
                                      <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                                    </div>
                                  </div>
                                  <Badge className={cn("text-xs font-medium ml-2", getDifficultyColor(skill.difficulty))}>
                                    {skill.difficulty}
                                  </Badge>
                                </div>

                                {/* Skill Type and Levels */}
                                <div className="space-y-2">
                                  {skill.skill_type && (
                                    <div className="flex items-center space-x-2">
                                      <Badge 
                                        className={cn(
                                          "text-xs",
                                          skill.skill_type === 'new' 
                                            ? "bg-red-100 text-red-700 border-red-300" 
                                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                        )}
                                      >
                                        {skill.skill_type === 'new' ? 'New Skill' : 'Upgrade Required'}
                                      </Badge>
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {skill.time_estimate}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {skill.skill_type === 'upgrade' && skill.current_level && skill.target_level && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-yellow-700 font-semibold">{skill.current_level}</span>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                        <span className="text-green-700 font-bold">{skill.target_level}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {skill.skill_type === 'new' && skill.target_level && (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                                      <div className="text-sm">
                                        <span className="text-gray-700">Target Level: </span>
                                        <span className="text-blue-700 font-bold">{skill.target_level}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Gap Addressed */}
                                {skill.gap_addressed && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <span className="text-xs font-semibold text-orange-900 block mb-1">Addresses Gap:</span>
                                        <span className="text-xs text-gray-700">{skill.gap_addressed}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Learning Path */}
                                <div className="border-t pt-3">
                                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Learning Path:</h5>
                                  <p className="text-sm text-gray-600 leading-relaxed">{skill.learning_path}</p>
                                </div>

                                {/* Resources */}
                                {skill.resources && skill.resources.length > 0 && (
                                  <div className="border-t pt-3">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Recommended Resources:
                                    </h5>
                                    <div className="space-y-1.5">
                                      {skill.resources.map((resource: string, idx: number) => (
                                        <div key={idx} className="flex items-start space-x-2 text-xs">
                                          <ChevronRight className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-700">{resource}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Unlocks */}
                                {skill.unlocks && skill.unlocks.length > 0 && (
                                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <span className="text-xs font-semibold text-blue-900 block mb-1">Unlocks Next:</span>
                                        <span className="text-xs text-gray-700">{skill.unlocks.join(', ')}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Phase Project Ideas */}
                      <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                        <div className="p-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <Code className="h-5 w-5 text-purple-600" />
                            <h4 className="font-bold text-gray-900">Suggested Projects for Phase {phase.phase}</h4>
                          </div>
                          <div className="space-y-3">
                            {phaseIndex === 0 && (
                              <>
                                <ProjectIdea 
                                  title="Personal Portfolio Website"
                                  description="Build a responsive portfolio to showcase your projects and skills"
                                />
                                <ProjectIdea 
                                  title="Task Management App"
                                  description="Create a todo list application with CRUD operations"
                                />
                                <ProjectIdea 
                                  title="Calculator or Converter Tool"
                                  description="Develop a functional calculator or unit converter"
                                />
                              </>
                            )}
                            {phaseIndex === 1 && (
                              <>
                                <ProjectIdea 
                                  title="Full-Stack Blog Platform"
                                  description="Build a blogging system with authentication and database"
                                />
                                <ProjectIdea 
                                  title="E-commerce Product Catalog"
                                  description="Create a product listing site with search and filters"
                                />
                                <ProjectIdea 
                                  title="REST API with Authentication"
                                  description="Develop a backend API with JWT authentication"
                                />
                              </>
                            )}
                            {phaseIndex >= 2 && (
                              <>
                                <ProjectIdea 
                                  title="Real-time Chat Application"
                                  description="Build a messaging app with WebSocket support"
                                />
                                <ProjectIdea 
                                  title="Analytics Dashboard"
                                  description="Create a data visualization dashboard with charts"
                                />
                                <ProjectIdea 
                                  title="Progressive Web App"
                                  description="Develop a mobile-responsive PWA with offline support"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Begin Your Journey?</h3>
                <p className="text-sm text-gray-600">Update your profile, explore opportunities, and start learning</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/candidate/profile/skills')}
                  className="border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Update Skills
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/candidate/interested-jobs')}
                  className="border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Jobs
                </Button>
                <Button
                  onClick={() => router.push('/candidate/courses')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

// Helper component for project ideas
function ProjectIdea({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all">
      <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
      <div>
        <h5 className="font-semibold text-sm text-gray-900">{title}</h5>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

