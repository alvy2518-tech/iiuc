"use client"

import { CommonNavbar } from "@/components/common-navbar"
import { HopeAI } from "@/components/hope/HopeAI"

export default function HopePage() {
  return (
    <div className="min-h-screen bg-background">
      <CommonNavbar />
      <HopeAI />
    </div>
  )
}
