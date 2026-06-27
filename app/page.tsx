"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { StatisticsSection } from "@/components/home/statistics-section"
import { NoticesSection } from "@/components/home/notices-section"
import { BlogsSection } from "@/components/home/blogs-section"
import { DevelopmentSection } from "@/components/home/development-section"
import { GallerySection } from "@/components/home/gallery-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatisticsSection />
        <NoticesSection />
        <BlogsSection />
        <DevelopmentSection />
        <GallerySection />
      </main>
      <Footer />
    </div>
  )
}
