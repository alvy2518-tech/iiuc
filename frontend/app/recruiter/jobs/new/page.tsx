"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { jobsAPI } from "@/lib/api"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { useLanguage } from "@/components/language-provider"

export default function PostJobPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [skillInput, setSkillInput] = useState("")
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    jobType: "Full-time" as "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" | "Campus Placement",
    workMode: "Remote" as "Remote" | "On-site" | "Hybrid",
    experienceLevel: "Mid Level" as "Entry Level" | "Mid Level" | "Senior" | "Lead/Manager",
    country: "",
    city: "",
    address: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "JPY",
    salaryPeriod: "per year" as "per hour" | "per month" | "per year" | "",
    jobDescription: "",
    responsibilities: "",
    qualifications: "",
    niceToHave: "",
    benefits: "",
    requiredSkills: [] as string[],
    applicationDeadline: "",
    numberOfPositions: 1,
    isStudentFriendly: false,
    minimumExperienceYears: "",
    status: "draft" as "draft" | "active" | "closed"
  })

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "active" | "closed") => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.jobTitle.trim()) {
      setError(t('recruiter.jobTitleRequired'))
      return
    }
    if (formData.jobDescription.length < 100) {
      setError(t('recruiter.jobDescriptionMinChars'))
      return
    }
    if (!formData.responsibilities.trim()) {
      setError(t('recruiter.responsibilitiesRequired'))
      return
    }
    if (!formData.qualifications.trim()) {
      setError(t('recruiter.qualificationsRequired'))
      return
    }
    if (formData.requiredSkills.length === 0) {
      setError(t('recruiter.atLeastOneSkillRequired'))
      return
    }
    if (!formData.country.trim()) {
      setError(t('recruiter.countryRequired'))
      return
    }
    if (!formData.city.trim()) {
      setError(t('recruiter.cityRequired'))
      return
    }
    
    setLoading(true)

    try {
      const submitData: any = {
        jobTitle: formData.jobTitle.trim(),
        department: formData.department.trim() || null,
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: formData.address.trim() || null,
        salaryCurrency: formData.salaryCurrency,
        salaryPeriod: formData.salaryPeriod || null,
        jobDescription: formData.jobDescription.trim(),
        responsibilities: formData.responsibilities.trim(),
        qualifications: formData.qualifications.trim(),
        niceToHave: formData.niceToHave.trim() || null,
        benefits: formData.benefits.trim() || null,
        requiredSkills: formData.requiredSkills,
        numberOfPositions: formData.numberOfPositions,
        isStudentFriendly: formData.isStudentFriendly,
        status
      }

      // Add optional fields only if they have values
      if (formData.salaryMin) {
        submitData.salaryMin = Number(formData.salaryMin)
      }
      if (formData.salaryMax) {
        submitData.salaryMax = Number(formData.salaryMax)
      }
      if (formData.applicationDeadline) {
        submitData.applicationDeadline = new Date(formData.applicationDeadline).toISOString()
      }
      if (formData.minimumExperienceYears) {
        submitData.minimumExperienceYears = Number(formData.minimumExperienceYears)
      }

      await jobsAPI.create(submitData)
      router.push("/recruiter/jobs")
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || t('recruiter.failedToCreateJob')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      })
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecruiterNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Sidebar - Navigation */}
          <RecruiterSidebar />

          {/* Main Content */}
          <div className="lg:col-span-10">
            <div className="max-w-4xl">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('recruiter.postANewJob')}</h1>
              
              <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.basicInformation')}</h2>
                  <div className="space-y-4">
              <div>
                      <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                        {t('jobs.jobTitle')} <span className="text-red-500">*</span>
                      </Label>
              <Input
                id="jobTitle"
                  placeholder="e.g., Senior UX Designer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="mt-1"
                        required
                />
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                          {t('recruiter.category')}
                        </Label>
                        <Select
                          id="department"
                          value={formData.department}
                          onValueChange={(value: string) => setFormData({ ...formData, department: value })}
                          className="text-sm"
                        >
                          <option value="">{t('recruiter.selectCategory')}</option>
                          <option value="Technology & Engineering">Technology & Engineering</option>
                          <option value="Data Science & AI/ML">Data Science & AI/ML</option>
                          <option value="Product">Product</option>
                          <option value="Design & Creative">Design & Creative</option>
                          <option value="Marketing & Growth">Marketing & Growth</option>
                          <option value="Sales & Business Development">Sales & Business Development</option>
                          <option value="Customer Support & Service">Customer Support & Service</option>
                          <option value="Finance & Accounting">Finance & Accounting</option>
                          <option value="HR & People">HR & People</option>
                          <option value="Admin & Virtual Assistance">Admin & Virtual Assistance</option>
                          <option value="Legal & Compliance">Legal & Compliance</option>
                          <option value="Operations & Supply Chain">Operations & Supply Chain</option>
                          <option value="Education & Training">Education & Training</option>
                          <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                          <option value="Translation & Localization">Translation & Localization</option>
                          <option value="Writing & Editing">Writing & Editing</option>
                          <option value="Media & Entertainment">Media & Entertainment</option>
                          <option value="Research & Analysis">Research & Analysis</option>
                          <option value="Quality & Compliance">Quality & Compliance</option>
                          <option value="Architecture & Built Environment">Architecture & Built Environment</option>
                          <option value="Security & Risk">Security & Risk</option>
                          <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                          <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                          <option value="Nonprofit & Social Impact">Nonprofit & Social Impact</option>
                          <option value="Sports & Wellness">Sports & Wellness</option>
                          <option value="Events & Experiences">Events & Experiences</option>
                          <option value="Procurement & Vendor">Procurement & Vendor</option>
                          <option value="Documentation & Content Ops">Documentation & Content Ops</option>
                          <option value="GIS & Mapping">GIS & Mapping</option>
                          <option value="Automation">Automation</option>
                          <option value="Specialized Services">Specialized Services</option>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="jobType" className="text-sm font-medium text-gray-700">
                          {t('recruiter.jobType')} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="jobType"
                          value={formData.jobType}
                          onValueChange={(value: string) => 
                            setFormData({ ...formData, jobType: value as typeof formData.jobType })
                          }
                          className="mt-1"
                          required
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                          <option value="Campus Placement">Campus Placement</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700">
                          {t('recruiter.experienceLevel')} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="experienceLevel"
                          value={formData.experienceLevel}
                          onValueChange={(value: string) => 
                            setFormData({ ...formData, experienceLevel: value as typeof formData.experienceLevel })
                          }
                          className="mt-1"
                          required
                        >
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior">Senior</option>
                          <option value="Lead/Manager">Lead/Manager</option>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="workMode" className="text-sm font-medium text-gray-700">
                          {t('recruiter.workMode')} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="workMode"
                          value={formData.workMode}
                          onValueChange={(value: string) => 
                            setFormData({ ...formData, workMode: value as typeof formData.workMode })
                          }
                          className="mt-1"
                          required
                        >
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Location */}
                <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.location')}</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                          {t('profile.country')} <span className="text-red-500">*</span>
                        </Label>
                <Input
                          id="country"
                          placeholder="e.g., United States"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1"
                          required
              />
            </div>

              <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="e.g., San Francisco"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        {t('recruiter.address')}
                      </Label>
              <Input
                        id="address"
                        placeholder="e.g., 123 Main St, Suite 100"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
              />
            </div>
          </div>
          </Card>

                {/* Job Description & Requirements */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.jobDescriptionRequirements')}</h2>
                  <div className="space-y-4">
              <div>
                      <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700">
                        {t('jobs.jobDescription')} <span className="text-red-500">*</span> {t('recruiter.minimum100Characters')}
                      </Label>
                <Textarea
                  id="jobDescription"
                        placeholder={t('recruiter.provideDetailedDescription')}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="mt-1 min-h-[120px]"
                        required
                />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.jobDescription.length} {t('recruiter.charactersMinimum')}
                      </p>
              </div>

              <div>
                      <Label htmlFor="responsibilities" className="text-sm font-medium text-gray-700">
                        {t('recruiter.responsibilities')} <span className="text-red-500">*</span>
                      </Label>
                <Textarea
                  id="responsibilities"
                        placeholder={t('recruiter.listKeyResponsibilities')}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="mt-1 min-h-[120px]"
                        required
                />
              </div>

              <div>
                      <Label htmlFor="qualifications" className="text-sm font-medium text-gray-700">
                        {t('recruiter.qualifications')} <span className="text-red-500">*</span>
                      </Label>
                <Textarea
                  id="qualifications"
                        placeholder={t('recruiter.listRequiredQualifications')}
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="mt-1 min-h-[120px]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="niceToHave" className="text-sm font-medium text-gray-700">
                        {t('recruiter.niceToHave')}
                      </Label>
                      <Textarea
                        id="niceToHave"
                        placeholder={t('recruiter.additionalSkills')}
                        value={formData.niceToHave}
                        onChange={(e) => setFormData({ ...formData, niceToHave: e.target.value })}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">
                        {t('recruiter.benefits')}
                      </Label>
                      <Textarea
                        id="benefits"
                        placeholder={t('recruiter.listBenefits')}
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          </Card>

                {/* Skills & Experience */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.skillsExperience')}</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="requiredSkills" className="text-sm font-medium text-gray-700">
                        {t('recruiter.requiredSkills')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          id="requiredSkills"
                          placeholder={t('recruiter.typeSkillAndPressEnter')}
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          className="bg-[#633ff3] hover:bg-[#5330d4] text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#633ff3]/10 text-[#633ff3] rounded-full text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="hover:text-[#5330d4]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('recruiter.atLeast1SkillRequired')} {formData.requiredSkills.length} {t('recruiter.skillsAdded')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <Label htmlFor="minimumExperienceYears" className="text-sm font-medium text-gray-700">
                          {t('recruiter.minimumExperienceYears')}
                        </Label>
                <Input
                          id="minimumExperienceYears"
                          type="number"
                          min="0"
                          placeholder="e.g., 3"
                          value={formData.minimumExperienceYears}
                          onChange={(e) => setFormData({ ...formData, minimumExperienceYears: e.target.value })}
                  className="mt-1"
                />
              </div>

                      <div className="flex items-center space-x-2 mt-6">
                    <input
                          type="checkbox"
                          id="isStudentFriendly"
                          checked={formData.isStudentFriendly}
                          onChange={(e) => setFormData({ ...formData, isStudentFriendly: e.target.checked })}
                          className="w-4 h-4 text-[#633ff3] border-gray-300 rounded focus:ring-[#633ff3]"
                        />
                        <Label htmlFor="isStudentFriendly" className="text-sm font-medium text-gray-700 cursor-pointer">
                          {t('recruiter.studentFriendly')}
                        </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Compensation */}
          <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.compensation')}</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <Label htmlFor="salaryMin" className="text-sm font-medium text-gray-700">
                          {t('recruiter.minimumSalary')}
                        </Label>
                <Input
                  id="salaryMin"
                  type="number"
                          min="0"
                  placeholder="e.g., 80000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                        <Label htmlFor="salaryMax" className="text-sm font-medium text-gray-700">
                          {t('recruiter.maximumSalary')}
                        </Label>
                <Input
                  id="salaryMax"
                  type="number"
                          min="0"
                  placeholder="e.g., 120000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="mt-1"
                />
            </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaryCurrency" className="text-sm font-medium text-gray-700">
                          {t('recruiter.currency')}
                        </Label>
                        <Select
                          id="salaryCurrency"
                          value={formData.salaryCurrency}
                          onValueChange={(value: string) => setFormData({ ...formData, salaryCurrency: value })}
                          className="mt-1"
                        >
                          <option value="JPY">JPY - Japanese Yen</option>
                          <option value="TK">TK - Taka</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="CNY">CNY - Chinese Yuan</option>
                          <option value="SGD">SGD - Singapore Dollar</option>
                          <option value="HKD">HKD - Hong Kong Dollar</option>
                          <option value="CHF">CHF - Swiss Franc</option>
                          <option value="SEK">SEK - Swedish Krona</option>
                          <option value="NOK">NOK - Norwegian Krone</option>
                          <option value="DKK">DKK - Danish Krone</option>
                          <option value="PLN">PLN - Polish Zloty</option>
                          <option value="BRL">BRL - Brazilian Real</option>
                          <option value="MXN">MXN - Mexican Peso</option>
                          <option value="ZAR">ZAR - South African Rand</option>
                          <option value="AED">AED - UAE Dirham</option>
                          <option value="SAR">SAR - Saudi Riyal</option>
                          <option value="KRW">KRW - South Korean Won</option>
                          <option value="THB">THB - Thai Baht</option>
                          <option value="IDR">IDR - Indonesian Rupiah</option>
                          <option value="PHP">PHP - Philippine Peso</option>
                          <option value="MYR">MYR - Malaysian Ringgit</option>
                          <option value="NZD">NZD - New Zealand Dollar</option>
                          <option value="RUB">RUB - Russian Ruble</option>
                          <option value="TRY">TRY - Turkish Lira</option>
                          <option value="ILS">ILS - Israeli Shekel</option>
                        </Select>
                      </div>

              <div>
                        <Label htmlFor="salaryPeriod" className="text-sm font-medium text-gray-700">
                          {t('recruiter.salaryPeriod')}
                        </Label>
                        <Select
                          id="salaryPeriod"
                          value={formData.salaryPeriod}
                          onValueChange={(value: string) => 
                            setFormData({ ...formData, salaryPeriod: value as typeof formData.salaryPeriod })
                          }
                          className="mt-1"
                        >
                          <option value="">{t('recruiter.selectPeriod')}</option>
                          <option value="per hour">{t('recruiter.perHour')}</option>
                          <option value="per month">{t('recruiter.perMonth')}</option>
                          <option value="per year">{t('recruiter.perYear')}</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Additional Details */}
                <Card className="p-4 sm:p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recruiter.additionalDetails')}</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="numberOfPositions" className="text-sm font-medium text-gray-700">
                          {t('recruiter.numberOfPositions')}
                        </Label>
                <Input
                          id="numberOfPositions"
                          type="number"
                          min="1"
                          value={formData.numberOfPositions}
                          onChange={(e) => setFormData({ ...formData, numberOfPositions: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                        <Label htmlFor="applicationDeadline" className="text-sm font-medium text-gray-700">
                          {t('recruiter.applicationDeadline')}
                        </Label>
                <Input
                          id="applicationDeadline"
                          type="date"
                          value={formData.applicationDeadline}
                          onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          </Card>

          {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
                    className="px-4 cursor-pointer sm:px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
              disabled={loading}
              onClick={() => router.push("/recruiter/jobs")}
            >
              {t('common.cancel')}
            </Button>
                  
            <Button
              type="button"
                    variant="outline"
                    className="px-4 cursor-pointer sm:px-6 py-2 text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "draft")}
            >
              {t('recruiter.saveAsDraft')}
            </Button>
            <Button
              type="button"
                    className="px-4 cursor-pointer sm:px-6 py-2 bg-[#633ff3] hover:bg-[#5330d4] text-white"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "active")}
            >
              {loading ? t('recruiter.posting') : t('recruiter.postJob')}
            </Button>
          </div>
        </form>
      </div>
          </div>
        </div>
      </div>
    </div>
  )
}
