"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquareWarning,
  Bell,
  FileText,
  Phone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import nepalFlagIcon from "@/public/nepal-flag-icon.webp";

export function HeroSection() {
  const { t, language } = useLanguage();

  const quickLinks = [
    {
      icon: MessageSquareWarning,
      label: t("fileComplaint"),
      href: "/complaints",
      gradient: "from-[#DC143C] to-[#DC143C]/80",
      description: language === "en" ? "Submit issues" : "समस्या पेश गर्नुहोस्",
    },
    {
      icon: Bell,
      label: t("viewNotices"),
      href: "/notices",
      gradient: "from-[#003893] to-[#003893]/80",
      description: language === "en" ? "Latest updates" : "नयाँ अपडेट",
    },
    {
      icon: FileText,
      label: t("readBlogs"),
      href: "/blogs",
      gradient: "from-[#DC143C] to-[#003893]",
      description: language === "en" ? "News & stories" : "समाचार र कथा",
    },
    {
      icon: Phone,
      label: t("contactUs"),
      href: "/contact",
      gradient: "from-[#003893] to-[#DC143C]",
      description: language === "en" ? "Get in touch" : "सम्पर्क गर्नुहोस्",
    },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003893]/[0.03] via-white to-[#DC143C]/[0.03]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003893' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Static gradient blurs */}
      <div className="absolute top-32 right-20 h-80 w-80 rounded-full bg-[#DC143C]/8 blur-2xl" />
      <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-[#003893]/8 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#DC143C]/5 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#003893]/10 shadow-sm mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#DC143C] opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#DC143C]" />
            </span>
            <span className="text-sm font-medium text-[#003893]">
              {t("welcome")}
            </span>
            <Image
              src={nepalFlagIcon}
              alt="Nepal Flag"
              className="w-8 h-auto md:hidden"
            />
          </div>

          {/* Title */}
          <h1 className="flex items-center justify-center gap-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#DC143C] via-[#003893] to-[#DC143C] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {t("portalName")}
            </span>

            <Image
              src={nepalFlagIcon}
              alt="Nepal Flag"
              className="w-20 h-auto"
            />
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-[#003893] font-medium mb-4">
            {t("heroSubtitle")}
          </p>

          {/* Mission */}
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("mission")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link href="/complaints">
              <Button className="rounded-full px-8 h-14 text-base bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                <MessageSquareWarning className="mr-2 h-5 w-5" />
                {t("fileComplaint")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/notices">
              <Button
                variant="outline"
                className="rounded-full px-8 h-14 text-base border-2 border-[#003893]/30 hover:border-[#003893] hover:bg-[#003893]/5 text-[#003893] transition-all hover:scale-105"
              >
                <Bell className="mr-2 h-5 w-5" />
                {t("viewNotices")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center group border border-[#003893]/10 shadow-sm hover:shadow-lg hover:border-[#DC143C]/20 transition-all hover:scale-105">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white mb-3 shadow-md`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#003893] group-hover:text-[#DC143C] transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground">
            {language === "en"
              ? "Scroll to explore"
              : "अन्वेषण गर्न स्क्रोल गर्नुहोस्"}
          </span>
          <div className="h-8 w-5 rounded-full border-2 border-[#003893]/30 flex justify-center pt-1.5">
            <div className="h-2 w-1 rounded-full bg-[#DC143C]" />
          </div>
        </div>
      </div> */}
    </section>
  );
}
