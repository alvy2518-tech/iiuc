"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { adminAPI } from "@/lib/api"

interface DashboardData {
  usersAnalyzed: number
  totalCandidates: number
  totalRecruiters: number
  jobsSuggested: number
  totalJobs: number
  activeJobs: number
  skillsMostInDemand: Array<{ skill: string; count: number }>
  commonGaps: Array<{ skill: string; count: number }>
  averageAnalysisScore: number
  totalAnalyses: number
}

interface AIInsights {
  summary: string
  keyFindings: string[]
  recommendations: string[]
  trends: string
  focusAreas: string[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    fetchDashboardData()
    fetchDetailedAnalytics()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardAnalytics()
      setDashboardData(response.data.data)
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push("/auth/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailedAnalytics = async () => {
    setInsightsLoading(true)
    try {
      const response = await adminAPI.getDetailedAnalytics(period)
      if (response.data.data.aiInsights) {
        setAiInsights(response.data.data.aiInsights)
      }
    } catch (error) {
      console.error("Failed to fetch detailed analytics:", error)
    } finally {
      setInsightsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#633ff3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-[#633ff3] text-white rounded hover:bg-[#5330d4]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('user')
                router.push('/auth/login')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Period Selector */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mr-2">Analytics Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#633ff3] focus:border-transparent"
            style={{ color: '#171a26', backgroundColor: '#ffffff' }}
          >
            <option value="7" style={{ color: '#171a26', backgroundColor: '#ffffff' }}>Last 7 days</option>
            <option value="30" style={{ color: '#171a26', backgroundColor: '#ffffff' }}>Last 30 days</option>
            <option value="90" style={{ color: '#171a26', backgroundColor: '#ffffff' }}>Last 90 days</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600" style={{ color: '#ffffff' }}>
            <p className="text-sm opacity-90 mb-1" style={{ color: '#ffffff' }}>Users Analyzed</p>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{dashboardData.usersAnalyzed}</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: '#ffffff' }}>Candidates with AI analysis</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600" style={{ color: '#ffffff' }}>
            <p className="text-sm opacity-90 mb-1" style={{ color: '#ffffff' }}>Jobs Suggested</p>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{dashboardData.jobsSuggested}</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: '#ffffff' }}>Total applications</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600" style={{ color: '#ffffff' }}>
            <p className="text-sm opacity-90 mb-1" style={{ color: '#ffffff' }}>Total Candidates</p>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{dashboardData.totalCandidates}</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: '#ffffff' }}>Registered candidates</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600" style={{ color: '#ffffff' }}>
            <p className="text-sm opacity-90 mb-1" style={{ color: '#ffffff' }}>Average Score</p>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{dashboardData.averageAnalysisScore.toFixed(1)}%</p>
            <p className="text-xs opacity-75 mt-1" style={{ color: '#ffffff' }}>AI compatibility score</p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalJobs}</p>
          </Card>
          <Card className="p-4 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Active Jobs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.activeJobs}</p>
          </Card>
          <Card className="p-4 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-300">Total Recruiters</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalRecruiters}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skills Most in Demand */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Skills Most in Demand</h2>
            <div className="space-y-3">
              {dashboardData.skillsMostInDemand.length > 0 ? (
                dashboardData.skillsMostInDemand.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3">#{index + 1}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {item.skill}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#633ff3] dark:text-purple-400">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>
          </Card>

          {/* Common Gaps */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Skill Gaps</h2>
            <div className="space-y-3">
              {dashboardData.commonGaps.length > 0 ? (
                dashboardData.commonGaps.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3">#{index + 1}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {item.skill}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI-Powered Insights</h2>
            {insightsLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#633ff3]"></div>
            )}
          </div>

          {aiInsights ? (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{aiInsights.summary}</p>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Findings</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300">{finding}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300">{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Trends */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Trends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{aiInsights.trends}</p>
              </div>

              {/* Focus Areas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#633ff3] text-white text-xs rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {insightsLoading ? "Generating insights..." : "No insights available"}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

