"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { profileAPI } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
// Layout provides navbar and sidebar

interface Skill {
  id: string
  skill_name: string
  skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  created_at: string
  updated_at: string
}

export default function SkillsManagementPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    skillName: "",
    skillLevel: "Beginner" as "Beginner" | "Intermediate" | "Advanced" | "Expert"
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return
      
      const user = JSON.parse(userStr)
      const response = await profileAPI.getCandidate(user.id)
      setSkills(response.data.skills || [])
    } catch (err) {
      console.error("Failed to fetch skills:", err)
      setError(t('profile.failedToLoadSkills'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (editingSkill) {
        // Update existing skill
        await profileAPI.updateSkill(editingSkill.id, formData)
        setSkills(skills.map(skill => 
          skill.id === editingSkill.id 
            ? { ...skill, skill_name: formData.skillName, skill_level: formData.skillLevel }
            : skill
        ))
      } else {
        // Add new skill
        const response = await profileAPI.addSkill(formData)
        setSkills([...skills, response.data.skill])
      }

      setFormData({ skillName: "", skillLevel: "Beginner" })
      setEditingSkill(null)
      setShowForm(false)
    } catch (err: any) {
      console.error("Failed to save skill:", err)
      setError(err.response?.data?.message || t('profile.failedToSaveSkill'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setFormData({
      skillName: skill.skill_name,
      skillLevel: skill.skill_level
    })
    setShowForm(true)
  }

  const handleDelete = async (skillId: string) => {
    if (!confirm(t('profile.deleteSkillConfirm'))) return

    try {
      await profileAPI.deleteSkill(skillId)
      setSkills(skills.filter(skill => skill.id !== skillId))
    } catch (err: any) {
      console.error("Failed to delete skill:", err)
      setError(err.response?.data?.message || t('profile.failedToDeleteSkill'))
    }
  }

  const handleCancel = () => {
    setFormData({ skillName: "", skillLevel: "Beginner" })
    setEditingSkill(null)
    setShowForm(false)
    setError("")
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "text-green-600 bg-green-50"
      case "Intermediate": return "text-blue-600 bg-blue-50"
      case "Advanced": return "text-orange-600 bg-orange-50"
      case "Expert": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const translateSkillLevel = (level: string) => {
    switch (level) {
      case "Beginner": return t('profile.beginner')
      case "Intermediate": return t('profile.intermediate')
      case "Advanced": return t('profile.advanced')
      case "Expert": return t('profile.expert')
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t('profile.skills')}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('profile.showcaseSkills')}
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2 w-full sm:w-auto whitespace-nowrap"
              disabled={showForm}
            >
              <Plus className="h-4 w-4" />
              {t('profile.addSkill')}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skillName">{t('profile.skillName')}</Label>
                    <Input
                      id="skillName"
                      value={formData.skillName}
                      onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                      placeholder="e.g., React, Python, Leadership"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="skillLevel">{t('profile.skillLevel')}</Label>
                    <Select
                      value={formData.skillLevel}
                      onValueChange={(value: string) => {
                        setFormData({ ...formData, skillLevel: value as "Beginner" | "Intermediate" | "Advanced" | "Expert" })
                      }}
                    >
                      <option value="Beginner">{t('profile.beginner')}</option>
                      <option value="Intermediate">{t('profile.intermediate')}</option>
                      <option value="Advanced">{t('profile.advanced')}</option>
                      <option value="Expert">{t('profile.expert')}</option>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? t('common.loading') : editingSkill ? t('profile.updateSkill') : t('profile.addSkill')}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Skills List */}
          {skills.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('profile.noSkillsAdded')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('profile.addFirstSkill')}
                </p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('profile.addYourFirstSkill')}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <Card key={skill.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{skill.skill_name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getSkillLevelColor(skill.skill_level)}`}>
                        {translateSkillLevel(skill.skill_level)}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(skill)}
                        aria-label="Edit skill"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(skill.id)}
                        aria-label="Delete skill"
                        className="h-9 w-9 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
    </div>
  )
}
