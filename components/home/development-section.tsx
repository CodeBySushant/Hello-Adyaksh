"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import useSWR from "swr"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Wallet, CheckCircle2, Clock, Loader2, PlayCircle } from "lucide-react"
import Link from "next/link"
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
}

const statusConfig: Record<string, { label: string; labelNe: string; icon: typeof Clock; color: string }> = {
  planned: { label: "Planned", labelNe: "योजनाबद्ध", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  ongoing: { label: "Ongoing", labelNe: "जारी", icon: PlayCircle, color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", labelNe: "सम्पन्न", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
}

export function DevelopmentSection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { data, isLoading } = useSWR<{ success: boolean; data: DevelopmentWork[] }>(
    "/api/development",
  )
  const works = (data?.data ?? []).slice(0, 4)
  const loading = isLoading

  return (
    <section ref={ref} className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gradient-nepal">{t("developmentWorks")}</h2>
            <p className="text-muted-foreground mt-1">
              {language === "en" ? "Track ongoing and completed projects" : "चलिरहेको र सम्पन्न परियोजनाहरू ट्र्याक गर्नुहोस्"}
            </p>
          </div>
          <Link href="/development">
            <Button variant="outline" className="rounded-full border-[#003893]/30 hover:border-[#003893]">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "en" ? "No development works available" : "कुनै विकास कार्य उपलब्ध छैन"}
          </div>
        ) : (
          /* Timeline */
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#DC143C] via-[#003893] to-[#DC143C]" />

            <div className="space-y-8">
              {works.map((work, index) => {
                const status = statusConfig[work.status] || statusConfig.planned
                const StatusIcon = status.icon
                const isLeft = index % 2 === 0

                return (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.15 }}
                    className={`relative flex items-start gap-8 ${
                      isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full gradient-nepal border-4 border-white shadow-lg z-10" />

                    {/* Content */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`ml-12 lg:ml-0 lg:w-1/2 ${isLeft ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}
                    >
                      <div className={`glass rounded-2xl p-6 ${isLeft ? "lg:mr-4" : "lg:ml-4"}`}>
                        <div className={`flex items-start justify-between mb-4 ${isLeft ? "lg:flex-row-reverse" : ""}`}>
                          <Badge className={`${status.color} border-0`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {language === "en" ? status.label : status.labelNe}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {work.start_date && safeFormatDate(new Date(work.start_date), "MMM yyyy")} - {work.expected_completion && safeFormatDate(new Date(work.expected_completion), "MMM yyyy")}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {language === "en" ? work.title_en : (work.title_np || work.title_en)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === "en" ? work.description_en : (work.description_np || work.description_en)}
                        </p>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{language === "en" ? "Progress" : "प्रगति"}</span>
                            <span className="font-medium text-[#003893]">{work.progress}%</span>
                          </div>
                          <Progress value={work.progress} className="h-2" />
                        </div>

                        {/* Budget */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {language === "en" ? "Budget" : "बजेट"}: NPR {(Number(work.budget) / 1000000).toFixed(1)}M
                          </span>
                          {work.budget > 0 && (
                            <span className="text-[#DC143C]">
                              {language === "en" ? "Spent" : "खर्च"}: {((Number(work.spent) / Number(work.budget)) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
