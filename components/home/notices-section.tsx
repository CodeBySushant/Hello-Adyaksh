"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import useSWR from "swr"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, FileText, Bell, Loader2 } from "lucide-react"
import Link from "next/link"
import { safeFormatDate } from "@/lib/date"

interface Notice {
  id: number
  title_en: string
  title_np: string
  content_en: string
  content_np: string
  category: string
  is_important: boolean
  publish_date: string
}

export function NoticesSection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { data, isLoading } = useSWR<{ success: boolean; data: Notice[] }>(
    "/api/notices",
  )
  const notices = (data?.data ?? []).slice(0, 3)
  const loading = isLoading

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      announcement: "bg-blue-100 text-blue-700",
      services: "bg-green-100 text-green-700",
      health: "bg-red-100 text-red-700",
      general: "bg-gray-100 text-gray-700",
    }
    return colors[category] || colors.general
  }

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
            <h2 className="text-3xl font-bold text-gradient-nepal">{t("recentNotices")}</h2>
            <p className="text-muted-foreground mt-1">
              {language === "en" ? "Stay updated with the latest announcements" : "नवीनतम घोषणाहरूसँग अद्यावधिक रहनुहोस्"}
            </p>
          </div>
          <Link href="/notices">
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
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "en" ? "No notices available" : "कुनै सूचना उपलब्ध छैन"}
          </div>
        ) : (
          /* Notices Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getCategoryColor(notice.category)} border-0`}>
                      <FileText className="h-3 w-3 mr-1" />
                      {notice.category || "General"}
                    </Badge>
                    {notice.is_important && (
                      <Bell className="h-4 w-4 text-[#DC143C]" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {safeFormatDate(new Date(notice.publish_date), "MMM d, yyyy")}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-[#DC143C] transition-colors line-clamp-2">
                  {language === "en" ? notice.title_en : (notice.title_np || notice.title_en)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {language === "en" ? notice.content_en : (notice.content_np || notice.content_en)}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-[#003893] group-hover:text-[#DC143C] transition-colors">
                  {t("readMore")}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
