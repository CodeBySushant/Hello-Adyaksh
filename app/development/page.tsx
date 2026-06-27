"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Hammer, Calendar, IndianRupee, CheckCircle2, Clock, PlayCircle, Loader2 } from "lucide-react"
import { safeFormatDate } from "@/lib/date"

interface DevelopmentWork {
  id: number
  title_en: string
  title_np: string
  description_en: string
  description_np: string
  category: string
  budget: number
  spent: number
  progress: number
  status: string
  start_date: string
  expected_completion: string
  location: string
}

export default function DevelopmentPage() {
  const { language } = useLanguage()
  const [works, setWorks] = useState<DevelopmentWork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorks()
  }, [])

  const fetchWorks = async () => {
    try {
      const res = await fetch("/api/development")
      const data = await res.json()
      if (data.success) {
        setWorks(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch development works:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {language === "en" ? "Completed" : "सम्पन्न"}
          </Badge>
        )
      case "ongoing":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <PlayCircle className="h-3 w-3 mr-1" />
            {language === "en" ? "Ongoing" : "चालू"}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            {language === "en" ? "Planned" : "योजना"}
          </Badge>
        )
    }
  }

  const completedCount = works.filter(w => w.status === "completed").length
  const ongoingCount = works.filter(w => w.status === "ongoing").length
  const totalBudget = works.reduce((acc, w) => acc + Number(w.budget || 0), 0)
  const totalSpent = works.reduce((acc, w) => acc + Number(w.spent || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#003893]/[0.02]">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003893]/5 border border-[#003893]/10 mb-6">
              <Hammer className="h-4 w-4 text-[#DC143C]" />
              <span className="text-sm font-medium text-[#003893]">
                {language === "en" ? "Track Progress" : "प्रगति ट्र्याक गर्नुहोस्"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
                {language === "en" ? "Development Works" : "विकास कार्यहरू"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Monitor ongoing and completed development projects in our ward with full transparency"
                : "पूर्ण पारदर्शिताका साथ हाम्रो वडामा चालू र सम्पन्न विकास परियोजनाहरू निगरानी गर्नुहोस्"}
            </p>
          </motion.div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10 text-center">
                  <div className="text-3xl font-bold text-[#003893] mb-1">{works.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Total Projects" : "कुल परियोजना"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{completedCount}</div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Completed" : "सम्पन्न"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{ongoingCount}</div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Ongoing" : "चालू"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DC143C]/20 text-center">
                  <div className="text-3xl font-bold text-[#DC143C] mb-1">
                    {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Budget Utilized" : "बजेट उपयोग"}
                  </p>
                </div>
              </motion.div>

              {/* Timeline */}
              {works.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  {language === "en" ? "No development works available" : "कुनै विकास कार्य उपलब्ध छैन"}
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#DC143C] via-[#003893] to-[#DC143C] hidden md:block" />
                  
                  <div className="space-y-8">
                    {works.map((work, index) => (
                      <motion.div
                        key={work.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative md:w-[calc(50%-2rem)] ${
                          index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                        }`}
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute top-8 w-4 h-4 rounded-full bg-gradient-to-r from-[#DC143C] to-[#003893] border-4 border-white hidden md:block ${
                          index % 2 === 0 ? "-right-[2.5rem]" : "-left-[2.5rem]"
                        }`} />
                        
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#003893]/10 hover:shadow-lg transition-shadow">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-[#003893]/5 to-[#DC143C]/5 p-4 flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-[#003893]">
                                {language === "en" ? work.title_en : (work.title_np || work.title_en)}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {work.start_date && safeFormatDate(new Date(work.start_date), "MMM yyyy")} - {work.expected_completion && safeFormatDate(new Date(work.expected_completion), "MMM yyyy")}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(work.status)}
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <p className="text-sm text-muted-foreground mb-4">
                              {language === "en" ? work.description_en : (work.description_np || work.description_en)}
                            </p>
                            
                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-[#003893]">
                                  {language === "en" ? "Progress" : "प्रगति"}
                                </span>
                                <span className="font-semibold text-[#DC143C]">{work.progress}%</span>
                              </div>
                              <Progress value={work.progress} className="h-2" />
                            </div>
                            
                            {/* Budget */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {language === "en" ? "Total Budget" : "कुल बजेट"}
                                </p>
                                <p className="font-semibold text-[#003893] flex items-center gap-1">
                                  <IndianRupee className="h-4 w-4" />
                                  {(Number(work.budget) / 100000).toFixed(1)}L
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {language === "en" ? "Spent" : "खर्च"}
                                </p>
                                <p className="font-semibold text-[#DC143C] flex items-center gap-1">
                                  <IndianRupee className="h-4 w-4" />
                                  {(Number(work.spent) / 100000).toFixed(1)}L
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
