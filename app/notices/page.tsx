"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Calendar,
  FileText,
  Bell,
  Download,
  Filter,
  Loader2,
} from "lucide-react"
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

const categoryConfig: Record<string, { label: string; labelNe: string; color: string }> = {
  announcement: { label: "Announcement", labelNe: "घोषणा", color: "bg-blue-100 text-blue-700" },
  services: { label: "Services", labelNe: "सेवा", color: "bg-green-100 text-green-700" },
  health: { label: "Health", labelNe: "स्वास्थ्य", color: "bg-red-100 text-red-700" },
  tender: { label: "Tender", labelNe: "टेण्डर", color: "bg-orange-100 text-orange-700" },
  general: { label: "General", labelNe: "सामान्य", color: "bg-gray-100 text-gray-700" },
}

export default function NoticesPage() {
  const { language } = useLanguage()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices")
      const data = await res.json()
      if (data.success) {
        setNotices(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter((notice) => {
    const title = language === "en" ? notice.title_en : (notice.title_np || notice.title_en)
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || notice.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...new Set(notices.map(n => n.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gradient-nepal mb-4">
              {language === "en" ? "Notices & Announcements" : "सूचना तथा घोषणा"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Stay updated with the latest announcements, meeting schedules, and tender notices from the ward office."
                : "वडा कार्यालयका नवीनतम घोषणा, बैठक तालिका, र टेण्डर सूचनासँग अद्यावधिक रहनुहोस्।"}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "en" ? "Search notices..." : "सूचना खोज्नुहोस्..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const config = categoryConfig[cat] || { label: cat, labelNe: cat, color: "bg-gray-100 text-gray-700" }
                return (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat ? "gradient-nepal" : ""}
                  >
                    {cat === "all" ? (
                      <>
                        <Filter className="h-4 w-4 mr-1" />
                        {language === "en" ? "All" : "सबै"}
                      </>
                    ) : (
                      language === "en" ? config.label : config.labelNe
                    )}
                  </Button>
                )
              })}
            </div>
          </motion.div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
            </div>
          ) : (
            <>
              {/* Notices Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotices.map((notice, index) => {
                  const config = categoryConfig[notice.category] || categoryConfig.general
                  return (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedNotice(notice)}
                      className="glass rounded-2xl p-6 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${config.color} border-0`}>
                            <FileText className="h-3 w-3 mr-1" />
                            {language === "en" ? config.label : config.labelNe}
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
                      <h3 className="font-semibold text-foreground mb-3 group-hover:text-[#DC143C] transition-colors line-clamp-2">
                        {language === "en" ? notice.title_en : (notice.title_np || notice.title_en)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {language === "en" ? notice.content_en : (notice.content_np || notice.content_en)}
                      </p>
                      <div className="flex items-center text-sm font-medium text-[#003893] group-hover:text-[#DC143C] transition-colors">
                        {language === "en" ? "Read More" : "थप पढ्नुहोस्"}
                        <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {filteredNotices.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {language === "en" ? "No notices found" : "कुनै सूचना फेला परेन"}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Notice Detail Modal */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {selectedNotice && (language === "en" ? selectedNotice.title_en : (selectedNotice.title_np || selectedNotice.title_en))}
            </DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={(categoryConfig[selectedNotice.category] || categoryConfig.general).color}>
                  {language === "en"
                    ? (categoryConfig[selectedNotice.category] || categoryConfig.general).label
                    : (categoryConfig[selectedNotice.category] || categoryConfig.general).labelNe}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {safeFormatDate(new Date(selectedNotice.publish_date), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed">
                  {language === "en" ? selectedNotice.content_en : (selectedNotice.content_np || selectedNotice.content_en)}
                </p>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button className="gradient-nepal">
                  <Download className="h-4 w-4 mr-2" />
                  {language === "en" ? "Download PDF" : "PDF डाउनलोड"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedNotice(null)}>
                  {language === "en" ? "Close" : "बन्द"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
