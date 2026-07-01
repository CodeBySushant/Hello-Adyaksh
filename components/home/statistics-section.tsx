"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/language-context";
import {
  Users,
  Home,
  LayoutGrid,
  Map as MapIcon,
  Building,
  BookOpen,
} from "lucide-react";
import { AdyakshCard } from "@/components/home/adyaksh-card";

function AnimatedCounter({
  value,
  duration = 2,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let rafId: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        // Keep decimals during the count-up so fractional values (area,
        // literacy %) animate smoothly instead of snapping at the end.
        setCount(value * progress);
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [value, duration, isInView]);

  return (
    <span ref={ref}>
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}


// Recharts is heavy and only matters once the user scrolls to this section.
// Load it lazily (client-only) so it never blocks first paint or janks the
// earlier sections while scrolling.
const StatisticsCharts = dynamic(
  () => import("./statistics-charts").then((m) => m.StatisticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10 h-80 animate-pulse"
          />
        ))}
      </div>
    ),
  },
);


export function StatisticsSection() {
  const { language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Real ward figures.
  const stats = [
    {
      icon: Users,
      label: language === "en" ? "Population" : "जनसंख्या",
      value: 25297,
      suffix: "",
      decimals: 0,
    },
    {
      icon: Home,
      label: language === "en" ? "Households" : "घरधुरी",
      value: 4498,
      suffix: "",
      decimals: 0,
    },
    {
      icon: LayoutGrid,
      label: language === "en" ? "Wards" : "वडा",
      value: 8,
      suffix: "",
      decimals: 0,
    },
    {
      icon: MapIcon,
      label: language === "en" ? "Area" : "क्षेत्रफल",
      value: 33.10,
      suffix: " km²",
      decimals: 2,
    },
    {
      icon: Building,
      label: language === "en" ? "Health Centers" : "स्वास्थ्य केन्द्र",
      value: 8,
      suffix: "",
      decimals: 0,
    },
    {
      icon: BookOpen,
      label: language === "en" ? "Literacy Rate" : "साक्षरता दर",
      value: 56.4,
      suffix: "%",
      decimals: 1,
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white via-[#003893]/[0.02] to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#DC143C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#003893]/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <AdyakshCard />
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mt-[10px] mb-4"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
              {language === "en"
                ? "Ward Statistics & Data"
                : "वडा तथ्याङ्क र डाटा"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "en"
              ? "Transparent data for informed citizens - explore our ward demographics and development progress"
              : "सूचित नागरिकहरूको लागि पारदर्शी डाटा - हाम्रो वडा जनसांख्यिकी र विकास प्रगति अन्वेषण गर्नुहोस्"}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-5 text-center shadow-sm border border-[#003893]/10 hover:shadow-lg hover:border-[#DC143C]/20 transition-all"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#DC143C] to-[#003893] text-white mb-3 shadow-md">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-[#003893] mb-1">
                <AnimatedCounter value={stat.value} decimals={stat.decimals} />
                {stat.suffix}
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {isInView && <StatisticsCharts language={language} isInView={isInView} />}
      </div>
    </section>
  );
}