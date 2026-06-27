"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight, Search, BookOpen, Loader2 } from "lucide-react"
import { safeFormatDate } from "@/lib/date"

interface Blog {
  id: number
  title_en: string
  title_np: string
  excerpt_en: string
  excerpt_np: string
  author_name: string
  category: string
  is_featured: boolean
  published_at: string
}

export default function BlogsPage() {
  const { language } = useLanguage()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs")
      const data = await res.json()
      if (data.success) {
        setBlogs(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const title = language === "en" ? blog.title_en : (blog.title_np || blog.title_en)
    const excerpt = language === "en" ? blog.excerpt_en : (blog.excerpt_np || blog.excerpt_en)
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (excerpt && excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const featuredBlog = filteredBlogs.find((b) => b.is_featured)
  const otherBlogs = filteredBlogs.filter((b) => !b.is_featured)

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
              <BookOpen className="h-4 w-4 text-[#DC143C]" />
              <span className="text-sm font-medium text-[#003893]">
                {language === "en" ? "Ward Updates & Stories" : "वडा अपडेट र कथाहरू"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
                {language === "en" ? "Blog & News" : "ब्लग र समाचार"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Stay informed about our ward activities, development updates, and community stories"
                : "हाम्रो वडा गतिविधि, विकास अपडेट, र सामुदायिक कथाहरू बारे जानकार रहनुहोस्"}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={language === "en" ? "Search blogs..." : "ब्लग खोज्नुहोस्..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-[#003893]/20 focus:border-[#DC143C]"
              />
            </div>
          </motion.div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
            </div>
          ) : (
            <>
              {/* Featured Blog */}
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12"
                >
                  <div className="bg-gradient-to-br from-[#003893]/5 to-[#DC143C]/5 rounded-3xl overflow-hidden border border-[#003893]/10">
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-[#DC143C]/20 to-[#003893]/20 flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-[#003893]/30" />
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-4 bg-[#DC143C] text-white">
                          {language === "en" ? "Featured" : "विशेष"}
                        </Badge>
                        <h2 className="text-2xl lg:text-3xl font-bold text-[#003893] mb-4">
                          {language === "en" ? featuredBlog.title_en : (featuredBlog.title_np || featuredBlog.title_en)}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          {language === "en" ? featuredBlog.excerpt_en : (featuredBlog.excerpt_np || featuredBlog.excerpt_en)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {featuredBlog.author_name || "Ward Office"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {safeFormatDate(new Date(featuredBlog.published_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <Button className="w-fit rounded-full bg-gradient-to-r from-[#DC143C] to-[#003893]">
                          {language === "en" ? "Read More" : "थप पढ्नुहोस्"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Blog Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherBlogs.map((blog, index) => (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#003893]/10 hover:shadow-lg hover:border-[#DC143C]/20 transition-all group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#003893]/10 to-[#DC143C]/10 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-[#003893]/20 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#003893] mb-2 line-clamp-2 group-hover:text-[#DC143C] transition-colors">
                        {language === "en" ? blog.title_en : (blog.title_np || blog.title_en)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {language === "en" ? blog.excerpt_en : (blog.excerpt_np || blog.excerpt_en)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {blog.author_name || "Ward Office"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {safeFormatDate(new Date(blog.published_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {filteredBlogs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    {language === "en" ? "No blogs found matching your search." : "तपाईंको खोजसँग मिल्दो कुनै ब्लग फेला परेन।"}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
