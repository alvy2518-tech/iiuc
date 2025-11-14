"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { profileAPI } from "@/lib/api"
import { RecruiterNavbar } from "@/components/recruiter-navbar"
import { RecruiterSidebar } from "@/components/recruiter-sidebar"

export default function RecruiterProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    companyName: "",
    companyLogoUrl: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    companyDescription: "",
    country: "",
    city: "",
    address: "",
  })

  const countries = [
    "United States","United Kingdom","Canada","Australia","India","Japan","Germany","France","Spain","Italy","Brazil","Mexico","China","Singapore","Netherlands"
  ]

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return
      
      const user = JSON.parse(userStr)
      const response = await profileAPI.getRecruiter(user.id)
      
      // profile data comes from profiles table
      const profileData = response.data.profile || {}
      // recruiterProfile comes from recruiter_profiles table
      const recruiterData = response.data.recruiterProfile || {}
      
      setFormData({
        // From profiles table
        fullName: profileData.full_name || user.fullName || "",
        phoneNumber: profileData.phone_number || "",
        
        // From recruiter_profiles table
        companyName: recruiterData.company_name || "",
        companyLogoUrl: recruiterData.company_logo_url || "",
        companyWebsite: recruiterData.company_website || "",
        companySize: recruiterData.company_size || "",
        industry: recruiterData.industry || "",
        companyDescription: recruiterData.company_description || "",
        country: recruiterData.country || "",
        city: recruiterData.city || "",
        address: recruiterData.address || "",
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
      await profileAPI.updateRecruiter(formData)
      
      // Clear profile cache to force refresh on next load
      localStorage.removeItem("profile_last_fetch")
      
      router.push("/recruiter/profile")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <RecruiterSidebar />
            <div className="lg:col-span-10">
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">Loading profile...</div>
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
          <RecruiterSidebar />

          <div className="lg:col-span-10">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h1>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <Card className="p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>

                {/* Company Information */}
                <Card className="p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#633ff3]" />
                    Company Information
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        required
                        placeholder="e.g. Google"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
                      <Input
                        id="companyLogoUrl"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={formData.companyLogoUrl}
                        onChange={(e) => setFormData({ ...formData, companyLogoUrl: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select
                          id="companySize"
                          value={formData.companySize}
                          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                          className="w-full"
                        >
                          <option value="">Select</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="500+">500+</option>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          placeholder="e.g. Technology"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Website</Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        placeholder="https://company.com"
                        value={formData.companyWebsite}
                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">Company Description</Label>
                      <Textarea
                        id="companyDescription"
                        placeholder="Tell candidates about your company..."
                        value={formData.companyDescription}
                        onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                        className="w-full"
                        rows={5}
                      />
                    </div>
                  </div>
                </Card>

                {/* Location */}
                <Card className="p-6 bg-white border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#633ff3]" />
                    Location
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          required
                          placeholder="e.g. USA"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          placeholder="e.g. San Francisco"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#633ff3] hover:bg-[#5330d4] text-white cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

