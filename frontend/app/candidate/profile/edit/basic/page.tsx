"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, MapPin, Calendar, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { profileAPI } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
// Layout provides navbar and sidebar

export default function BasicProfileEditPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    profilePictureUrl: "",
    headline: "",
    dateOfBirth: "",
    profileType: "Student" as "Student" | "Recent Graduate" | "Professional" | "Career Break",
    currentEducationStatus: "",
    expectedGraduationDate: "",
    yearsOfExperience: "",
    currentJobTitle: "",
    currentCompany: "",
    country: "",
    city: "",
    willingToRelocate: false,
    preferredWorkModes: [] as string[],
    bio: "",
    portfolioWebsite: "",
    linkedinUrl: "",
    githubUrl: "",
    behanceUrl: "",
  })

  const workModes = [
    { value: "Remote", label: t('profile.remote') },
    { value: "On-site", label: t('profile.onsite') },
    { value: "Hybrid", label: t('profile.hybrid') }
  ]

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return
      
      const user = JSON.parse(userStr)
      const response = await profileAPI.getCandidate(user.id)
      
      setProfileData(response.data)
      
      // profile data comes from profiles table
      const profileData = response.data.profile || {}
      // candidateProfile comes from candidate_profiles table
      const candidateData = response.data.candidateProfile || {}
      
      setFormData({
        // From profiles table
        fullName: (profileData.full_name || user.fullName || "").toString(),
        phoneNumber: (profileData.phone_number || "").toString(),
        profilePictureUrl: (profileData.profile_picture_url || "").toString(),
        
        // From candidate_profiles table
        headline: (candidateData.headline || "").toString(),
        dateOfBirth: candidateData.date_of_birth 
          ? candidateData.date_of_birth.substring(0, 10) // Convert to YYYY-MM-DD for date input
          : "",
        profileType: (candidateData.profile_type || "Student") as "Student" | "Recent Graduate" | "Professional" | "Career Break",
        currentEducationStatus: (candidateData.current_education_status || "").toString(),
        expectedGraduationDate: candidateData.expected_graduation_date 
          ? candidateData.expected_graduation_date.substring(0, 7) // Convert YYYY-MM-DD to YYYY-MM
          : "",
        yearsOfExperience: (candidateData.years_of_experience || "").toString(),
        currentJobTitle: (candidateData.current_job_title || "").toString(),
        currentCompany: (candidateData.current_company || "").toString(),
        country: (candidateData.country || "").toString(),
        city: (candidateData.city || "").toString(),
        willingToRelocate: Boolean(candidateData.willing_to_relocate),
        preferredWorkModes: Array.isArray(candidateData.preferred_work_modes) ? candidateData.preferred_work_modes : [],
        bio: (candidateData.bio || "").toString(),
        portfolioWebsite: (candidateData.portfolio_website || "").toString(),
        linkedinUrl: (candidateData.linkedin_url || "").toString(),
        githubUrl: (candidateData.github_url || "").toString(),
        behanceUrl: (candidateData.behance_url || "").toString(),
      })
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Prepare data according to schema: send null for empty dateOfBirth
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        phoneNumber: formData.phoneNumber || null,
        profilePictureUrl: formData.profilePictureUrl || null,
        headline: formData.headline || null,
        currentEducationStatus: formData.currentEducationStatus || null,
        expectedGraduationDate: formData.expectedGraduationDate || null,
        yearsOfExperience: formData.yearsOfExperience || null,
        currentJobTitle: formData.currentJobTitle || null,
        currentCompany: formData.currentCompany || null,
        bio: formData.bio || null,
        portfolioWebsite: formData.portfolioWebsite || null,
        linkedinUrl: formData.linkedinUrl || null,
        githubUrl: formData.githubUrl || null,
        behanceUrl: formData.behanceUrl || null,
        preferredWorkModes: formData.preferredWorkModes.length > 0 ? formData.preferredWorkModes : null,
      }
      
      await profileAPI.updateCandidate(submitData)
      
      // Clear profile cache to force refresh on next load
      localStorage.removeItem("profile_last_fetch")
      
      router.push("/candidate/profile/edit")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const handleWorkModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      preferredWorkModes: prev.preferredWorkModes.includes(mode)
        ? prev.preferredWorkModes.filter(m => m !== mode)
        : [...prev.preferredWorkModes, mode]
    }))
  }

  if (loadingData) {
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
            <Card className="p-6 bg-white border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex justify-center">
            <div className="relative">
              {formData.profilePictureUrl ? (
                <img 
                  src={formData.profilePictureUrl} 
                  alt={formData.fullName || "Profile"} 
                  className="h-16 w-16 rounded-full object-cover"
                  style={{ border: '2px solid #633ff3' }}
                />
              ) : (
                <div 
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                  style={{ border: '2px solid #633ff3' }}
                >
                  <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile.basicInformation')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('profile.fullName')} *</Label>
                <Input
                  id="fullName"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.fullName ?? ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <p className="text-xs text-gray-500">{(formData.fullName ?? "").length}/100 {t('profile.characters')} ({t('profile.min')} 2)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('profile.phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber ?? ""}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">{t('profile.professionalHeadline')}</Label>
              <Input
                id="headline"
                placeholder={t('profile.headlinePlaceholder')}
                maxLength={200}
                value={formData.headline ?? ""}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
              <p className="text-xs text-gray-500">{(formData.headline ?? "").length}/200 {t('profile.characters')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('profile.dateOfBirth')}
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth ?? ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePictureUrl">{t('profile.profilePictureUrl')}</Label>
              <Input
                id="profilePictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.profilePictureUrl ?? ""}
                onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('profile.professionalStatus')}
            </h2>
            
            <div className="space-y-2">
              <Label htmlFor="profileType">{t('profile.profileType')} *</Label>
              <Select
                id="profileType"
                required
                value={formData.profileType}
                onChange={(e) => setFormData({ ...formData, profileType: e.target.value as any })}
              >
                <option value="Student">{t('profile.student')}</option>
                <option value="Recent Graduate">{t('profile.recentGraduate')}</option>
                <option value="Professional">{t('profile.professional')}</option>
                <option value="Career Break">{t('profile.careerBreak')}</option>
              </Select>
            </div>

            {formData.profileType === "Student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEducationStatus">{t('profile.currentYear')}</Label>
                  <Select
                    id="currentEducationStatus"
                    value={formData.currentEducationStatus ?? ""}
                    onChange={(e) => setFormData({ ...formData, currentEducationStatus: e.target.value })}
                  >
                    <option value="">{t('profile.select')}</option>
                    <option value="First Year">{t('profile.firstYear')}</option>
                    <option value="Second Year">{t('profile.secondYear')}</option>
                    <option value="Third Year">{t('profile.thirdYear')}</option>
                    <option value="Final Year">{t('profile.finalYear')}</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedGraduationDate">{t('profile.expectedGraduation')}</Label>
                  <Input
                    id="expectedGraduationDate"
                    type="month"
                    value={formData.expectedGraduationDate ?? ""}
                    onChange={(e) => setFormData({ ...formData, expectedGraduationDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(formData.profileType === "Professional" || formData.profileType === "Recent Graduate") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentJobTitle">{t('profile.currentJobTitle')}</Label>
                  <Input
                    id="currentJobTitle"
                    value={formData.currentJobTitle ?? ""}
                    onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                    placeholder="e.g. Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCompany">{t('profile.currentCompany')}</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany ?? ""}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    placeholder="e.g. Google, Microsoft"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">{t('profile.yearsOfExperience')}</Label>
              <Input
                id="yearsOfExperience"
                value={formData.yearsOfExperience ?? ""}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                placeholder="e.g. 2 years, Fresh Graduate"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('common.location')} & {t('profile.preferences')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  required
                  value={formData.country ?? ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city ?? ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t('profile.preferredWorkModes')}</Label>
              <div className="grid grid-cols-3 gap-3">
                {workModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleWorkModeToggle(mode.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.preferredWorkModes.includes(mode.value)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{mode.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="willingToRelocate"
                checked={formData.willingToRelocate}
                onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="willingToRelocate">{t('profile.willingToRelocate')}</Label>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('profile.about')}</h2>
            <Textarea
              placeholder={t('profile.aboutPlaceholder')}
              maxLength={500}
              value={formData.bio ?? ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-gray-500">{(formData.bio ?? "").length}/500 {t('profile.characters')}</p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('profile.professionalLinks')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="portfolioWebsite">{t('profile.portfolioWebsite')}</Label>
                <Input
                  id="portfolioWebsite"
                  type="url"
                  placeholder="https://myportfolio.com"
                  value={formData.portfolioWebsite ?? ""}
                  onChange={(e) => setFormData({ ...formData, portfolioWebsite: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">{t('profile.linkedin')}</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl ?? ""}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">{t('profile.github')}</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.githubUrl ?? ""}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behanceUrl">{t('profile.behance')}</Label>
                <Input
                  id="behanceUrl"
                  type="url"
                  placeholder="https://behance.net/username"
                  value={formData.behanceUrl ?? ""}
                  onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('actions.saveChanges')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/candidate/profile/edit")}
            >
              {t('common.cancel')}
            </Button>
          </div>
              </form>
            </Card>
    </div>
  )
}
