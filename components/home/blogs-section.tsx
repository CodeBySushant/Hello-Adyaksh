"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import useSWR from "swr";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { safeFormatDate } from "@/lib/date";

interface Blog {
  id: number;
  title_en: string;
  title_np: string;
  excerpt_en: string;
  excerpt_np: string;
  author_name: string;
  is_featured: boolean;
  published_at: string;
  cover_image_url: string | null;
}

export function BlogsSection() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data, isLoading } = useSWR<{ success: boolean; data: Blog[] }>(
    "/api/blogs",
  );
  const blogs = (data?.data ?? []).slice(0, 3);
  const loading = isLoading;

  const featuredBlog = blogs.find((b) => b.is_featured) || blogs[0];
  const otherBlogs = blogs.filter((b) => b.id !== featuredBlog?.id).slice(0, 2);

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-muted/30 to-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gradient-nepal">
              {t("latestBlogs")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {language === "en"
                ? "Insights and updates from the ward"
                : "वडाबाट अन्तरदृष्टि र अपडेटहरू"}
            </p>
          </div>
          <Link href="/blogs">
            <Button
              variant="outline"
              className="rounded-full border-[#003893]/30 hover:border-[#003893]"
            >
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
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "en" ? "No blogs available" : "कुनै ब्लग उपलब्ध छैन"}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Featured Blog */}
            {featuredBlog && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.01 }}
                className="group cursor-pointer"
              >
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden mb-4">
                  {featuredBlog.cover_image_url ? (
                    <Image
                      src={featuredBlog.cover_image_url}
                      alt={featuredBlog.title_en}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 gradient-nepal opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-6xl font-bold">
                          Featured
                        </span>
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#DC143C] text-white text-xs font-medium mb-3">
                      Featured
                    </span>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                      {language === "en"
                        ? featuredBlog.title_en
                        : featuredBlog.title_np || featuredBlog.title_en}
                    </h3>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {language === "en"
                    ? featuredBlog.excerpt_en
                    : featuredBlog.excerpt_np || featuredBlog.excerpt_en}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredBlog.author_name || "Ward Office"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {safeFormatDate(new Date(featuredBlog.published_at), "MMM d, yyyy")}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Other Blogs */}
            <div className="space-y-6">
              {otherBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="glass rounded-2xl p-6 cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0 h-20 w-20 rounded-xl overflow-hidden gradient-nepal opacity-70">
                      {blog.cover_image_url ? (
                        <Image
                          src={blog.cover_image_url}
                          alt={blog.title_en}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/50 text-2xl font-bold">
                            {index + 2}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-[#DC143C] transition-colors line-clamp-2">
                        {language === "en"
                          ? blog.title_en
                          : blog.title_np || blog.title_en}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {language === "en"
                          ? blog.excerpt_en
                          : blog.excerpt_np || blog.excerpt_en}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
