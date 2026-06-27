"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
  Loader2,
  Calendar,
} from "lucide-react"
import useSWR from "swr"

interface GalleryItem {
  id: number
  title_en: string
  title_np: string | null
  description_en: string | null
  description_np: string | null
  media_type: string
  media_url: string
  thumbnail_url: string | null
  category: string | null
  event_date: string | null
  is_featured: boolean
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORIES = [
  { id: "all", labelEn: "All", labelNp: "सबै" },
  { id: "development", labelEn: "Development", labelNp: "विकास" },
  { id: "events", labelEn: "Events", labelNp: "कार्यक्रम" },
  { id: "meetings", labelEn: "Meetings", labelNp: "बैठक" },
  { id: "community", labelEn: "Community", labelNp: "समुदाय" },
  { id: "health", labelEn: "Health", labelNp: "स्वास्थ्य" },
]

export default function GalleryPage() {
  const { language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("all")
  const [lightboxId, setLightboxId] = useState<number | null>(null)

  const apiUrl = `/api/gallery${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`
  const { data, isLoading } = useSWR<{ success: boolean; data: GalleryItem[] }>(apiUrl, fetcher)

  const items = data?.data || []

  const lightboxItem = items.find((i) => i.id === lightboxId) ?? null
  const lightboxIndex = items.findIndex((i) => i.id === lightboxId)

  const goNext = () => {
    const next = items[(lightboxIndex + 1) % items.length]
    setLightboxId(next.id)
  }
  const goPrev = () => {
    const prev = items[(lightboxIndex - 1 + items.length) % items.length]
    setLightboxId(prev.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#003893]/[0.02]">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DC143C]/5 border border-[#DC143C]/10 mb-6">
              <Camera className="h-4 w-4 text-[#DC143C]" />
              <span className="text-sm font-medium text-[#003893]">
                {language === "en" ? "Photos & Videos" : "फोटो र भिडियो"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
                {language === "en" ? "Media Gallery" : "मिडिया ग्यालरी"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Browse photos and videos from our ward activities and development works"
                : "हाम्रो वडा गतिविधि र विकास कार्यहरूका फोटो र भिडियो हेर्नुहोस्"}
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full transition-all ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-[#DC143C] to-[#003893] text-white border-transparent"
                    : "border-[#003893]/20 text-[#003893] hover:bg-[#003893]/5"
                }`}
              >
                {language === "en" ? cat.labelEn : cat.labelNp}
              </Button>
            ))}
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && items.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {language === "en" ? "No media in this category yet." : "यस वर्गमा अहिले कुनै मिडिया छैन।"}
              </p>
            </motion.div>
          )}

          {/* Masonry-style Grid */}
          {!isLoading && items.length > 0 && (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  // First item and every 7th item is a featured large tile
                  const isLarge = index === 0 || index % 7 === 0

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLightboxId(item.id)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden group ${
                        isLarge ? "md:col-span-2 md:row-span-2" : ""
                      }`}
                    >
                      {/* Media */}
                      {item.media_type === "video" ? (
                        <video
                          src={item.media_url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={language === "ne" && item.title_np ? item.title_np : item.title_en}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      )}

                      {/* Video play button */}
                      {item.media_type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-5 w-5 text-[#DC143C] ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      )}

                      {/* Featured badge */}
                      {item.is_featured && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#DC143C] text-white text-xs rounded-full font-medium shadow">
                          {language === "en" ? "Featured" : "विशेष"}
                        </span>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Title on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-white font-semibold text-sm line-clamp-1">
                          {language === "ne" && item.title_np ? item.title_np : item.title_en}
                        </p>
                        {item.event_date && (
                          <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.event_date).toLocaleDateString(
                              language === "ne" ? "ne-NP" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <Dialog open={lightboxId !== null} onOpenChange={(open) => !open && setLightboxId(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative">
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 text-white hover:bg-white/10 rounded-full"
              onClick={() => setLightboxId(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Prev */}
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full h-10 w-10"
                onClick={goPrev}
              >
                <ChevronLeft className="h-7 w-7" />
              </Button>
            )}

            {/* Next */}
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full h-10 w-10"
                onClick={goNext}
              >
                <ChevronRight className="h-7 w-7" />
              </Button>
            )}

            {/* Media */}
            <div className="aspect-video flex items-center justify-center bg-black">
              {lightboxItem?.media_type === "video" ? (
                <video
                  key={lightboxItem.id}
                  src={lightboxItem.media_url}
                  className="max-h-[70vh] w-full object-contain"
                  controls
                  autoPlay
                />
              ) : lightboxItem ? (
                <img
                  key={lightboxItem.id}
                  src={lightboxItem.media_url}
                  alt={lightboxItem.title_en}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : null}
            </div>

            {/* Caption */}
            {lightboxItem && (
              <div className="p-5 text-center">
                <h3 className="text-white text-lg font-semibold">
                  {language === "ne" && lightboxItem.title_np
                    ? lightboxItem.title_np
                    : lightboxItem.title_en}
                </h3>
                {(lightboxItem.description_en || lightboxItem.description_np) && (
                  <p className="text-white/60 text-sm mt-1">
                    {language === "ne" && lightboxItem.description_np
                      ? lightboxItem.description_np
                      : lightboxItem.description_en}
                  </p>
                )}
                {lightboxItem.event_date && (
                  <p className="text-white/40 text-xs mt-2 flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(lightboxItem.event_date).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                )}
                {items.length > 1 && (
                  <p className="text-white/30 text-xs mt-2">
                    {lightboxIndex + 1} / {items.length}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}