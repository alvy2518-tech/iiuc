"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Briefcase, User, LogOut, Menu, X, Bookmark, Heart, TrendingUp, Home, MessageCircle, BookOpen, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export function CommonNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!mounted) return
    const original = document.body.style.overflow
    if (mobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = original
    return () => { document.body.style.overflow = original }
  }, [mobileMenuOpen, mounted])

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    localStorage.removeItem("profile_last_fetch")
    setUser(null)
    router.push("/auth/login")
    setMobileMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-[100] w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/candidate/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#633ff3]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#633ff3]">{t('common.appName')}</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5 flex-1 justify-center overflow-x-auto">
            <Link 
              href="/candidate/dashboard" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/dashboard') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.home')}</span>
            </Link>
            <Link 
              href="/candidate/jobs" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/jobs') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.jobs')}</span>
            </Link>
            <Link 
              href="/candidate/saved-jobs" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/saved-jobs') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <Bookmark className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.savedJobs')}</span>
            </Link>
            <Link 
              href="/candidate/interested-jobs" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/interested-jobs') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.interestedJobs')}</span>
            </Link>
            <Link 
              href="/candidate/roadmap" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/roadmap') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.roadmap')}</span>
            </Link>
            <Link 
              href="/candidate/courses" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/courses') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">Courses</span>
            </Link>
            <Link 
              href="/candidate/inbox" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] relative ${
                isActive('/candidate/inbox') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <Inbox className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">Inbox</span>
            </Link>
            <Link 
              href="/candidate/hope" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                isActive('/candidate/hope') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">Hope AI</span>
            </Link>
            <Link 
              href="/candidate/profile/edit" 
              className={`text-xs flex flex-col items-center gap-1 font-medium transition-colors px-2 py-1 min-w-[60px] ${
                pathname.startsWith('/candidate/profile') 
                  ? 'text-[#633ff3] font-bold' 
                  : 'text-gray-600 hover:text-[#633ff3]'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">{t('common.profile')}</span>
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#633ff3]/10 border-2 border-[#633ff3]/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-[#633ff3]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName || t('common.user')}
                  </span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </Button>
              </div>
            ) : (
              <>
                <LanguageSwitcher />
                <Button className="bg-[#633ff3] hover:bg-[#5330d4] text-white px-4 py-2">
                  {t('common.postJob')}
                </Button>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2">
                    {t('common.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Slide-over Drawer (portal to body to escape stacking contexts) */}
        {mounted && createPortal(
        <div className={`fixed inset-0 z-[2147483647] md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileMenuOpen}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className={`fixed right-0 top-0 h-screen w-80 max-w-[85vw] bg-white shadow-xl transition-transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between px-4 py-4 border-b sticky top-0 bg-white z-20">
              <span className="text-sm font-semibold text-gray-700">{t('common.menu')}</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label={t('common.close')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-2 py-3 overflow-y-auto h-[calc(100%-56px)] bg-white relative z-10">
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <Link
                href="/candidate/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive('/candidate/dashboard') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('common.home')}
              </Link>
              <Link
                href="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActive('/candidate/jobs') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('common.jobs')}
              </Link>
              <Link
                href="/candidate/saved-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/saved-jobs') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                {t('common.savedJobs')}
              </Link>
              <Link
                href="/candidate/interested-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/interested-jobs') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="h-4 w-4" />
                {t('common.interestedJobs')}
              </Link>
              <Link
                href="/candidate/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/roadmap') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                {t('common.roadmap')}
              </Link>
              <Link
                href="/candidate/courses"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/courses') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>
              <Link
                href="/candidate/inbox"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/inbox') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Inbox className="h-4 w-4" />
                Inbox
              </Link>
              <Link
                href="/candidate/hope"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive('/candidate/hope') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Hope AI
              </Link>
              <button
                onClick={() => { router.push('/candidate/profile/edit'); setProfileOpen(true); }}
                className={`text-sm font-medium px-3 py-2 rounded-lg text-left transition-colors ${
                  pathname.startsWith('/candidate/profile') ? 'text-[#633ff3] bg-[#633ff3]/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('common.profile')}
              </button>
              {/* Profile section items for candidates */}
              {user && user.role === 'candidate' && profileOpen && (
                <div className="ml-2 mt-1 mb-2 flex flex-col gap-1">
                  <Link href="/candidate/profile/edit/basic" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.basicInfo')}</Link>
                  <Link href="/candidate/profile/skills" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.skills')}</Link>
                  <Link href="/candidate/profile/experience" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.experience')}</Link>
                  <Link href="/candidate/profile/education" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.education')}</Link>
                  <Link href="/candidate/profile/projects" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.projects')}</Link>
                  <Link href="/candidate/profile/certifications" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.certifications')}</Link>
                  <Link href="/candidate/profile/preferences" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">{t('profile.preferences')}</Link>
                  <Link href="/candidate/cv" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">CV Builder</Link>
                </div>
              )}

              <div className="pt-2 mt-2 border-t">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="h-8 w-8 rounded-full bg-[#633ff3]/10 border-2 border-[#633ff3]/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-[#633ff3]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{user.fullName || 'User'}</div>
                        <div className="text-[11px] text-gray-500 capitalize">{user.role}</div>
                      </div>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="mx-3 border-gray-300 text-gray-700">
                      <LogOut className="h-4 w-4 mr-2" /> {t('common.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700">{t('common.signIn')}</Button>
                    </Link>
                    <Button className="w-full bg-[#633ff3] hover:bg-[#5330d4] text-white">{t('common.postJob')}</Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>, document.body)}
      </div>
    </header>
  )
}

