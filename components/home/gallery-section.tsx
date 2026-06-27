"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, X, Loader2, Camera } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
}

const CATEGORIES = [
  { id: "all", labelEn: "All", labelNp: "सबै" },
  { id: "events", labelEn: "Events", labelNp: "कार्यक्रम" },
  { id: "development", labelEn: "Development", labelNp: "विकास" },
  { id: "meetings",    labelEn: "Meetings",    labelNp: "बैठक" },
  { id: "community",   labelEn: "Community",   labelNp: "समुदाय" },
]

export function GallerySection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeCategory, setActiveCategory] = useState("all")
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  const apiUrl = `/api/gallery?limit=6${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`
  const { data, isLoading } = useSWR<{ success: boolean; data: GalleryItem[] }>(apiUrl)

  const items = data?.data || []

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gradient-nepal">{t("mediaGallery")}</h2>
            <p className="text-muted-foreground mt-1">
              {language === "en"
                ? "Photos and videos from our activities"
                : "हाम्रा गतिविधिहरूबाट फोटो र भिडियो"}
            </p>
          </div>
          <Link href="/gallery">
            <Button variant="outline" className="rounded-full border-[#003893]/30 hover:border-[#003893]">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[#DC143C] to-[#003893] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {language === "ne" ? cat.labelNp : cat.labelEn}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{language === "en" ? "No media found" : "कुनै मिडिया फेला परेन"}</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && items.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightboxItem(item)}
                className={`relative cursor-pointer rounded-2xl overflow-hidden group ${
                  index === 0
                    ? "md:col-span-2 md:row-span-2 aspect-[4/3]"
                    : "aspect-square"
                }`}
                style={index === 0 ? { minHeight: "300px" } : {}}
              >
                {/* Real media */}
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={item.media_url}
                    alt={language === "ne" && item.title_np ? item.title_np : item.title_en}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}

                {/* Video overlay */}
                {item.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/90 shadow flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-[#DC143C] ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Featured badge */}
                {item.is_featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#DC143C] text-white text-xs rounded-full">
                    {language === "en" ? "Featured" : "विशेष"}
                  </span>
                )}

                {/* Hover overlay + title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-medium text-sm line-clamp-1">
                    {language === "ne" && item.title_np ? item.title_np : item.title_en}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightboxItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl overflow-hidden bg-black">
              {lightboxItem.media_type === "video" ? (
                <video
                  src={lightboxItem.media_url}
                  className="w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={lightboxItem.media_url}
                  alt={lightboxItem.title_en}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
            <div className="text-center mt-4">
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
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}