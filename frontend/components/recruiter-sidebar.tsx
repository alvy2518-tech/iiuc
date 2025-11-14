"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Briefcase, User, PlusCircle, MessageSquare, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

export function RecruiterSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/recruiter/dashboard", labelKey: "navigation.dashboard", icon: () => <div className="w-5 h-5 flex items-center justify-center"><div className="w-4 w-4 border-2 border-current rounded"></div></div> },
    { href: "/recruiter/jobs", labelKey: "navigation.jobPostings", icon: Briefcase },
    { href: "/recruiter/interview", label: "Interview", icon: MessageSquare },
    { href: "/recruiter/inbox", label: "Inbox", icon: Inbox },
    { href: "/recruiter/profile", labelKey: "common.profile", icon: User },
    { href: "/recruiter/jobs/new", labelKey: "navigation.postJob", icon: PlusCircle },
  ]

  return (
    <div className="hidden lg:block lg:col-span-2">
      <Card className="p-3 sm:p-4 bg-white border border-gray-200 sticky top-20 self-start">
        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/recruiter/dashboard" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm",
                  isActive 
                    ? "bg-[#633ff3]/10 text-[#633ff3] font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon />
                <span>{item.labelKey ? t(item.labelKey) : item.label}</span>
              </Link>
            )
          })}
        </nav>
      </Card>
    </div>
  )
}

