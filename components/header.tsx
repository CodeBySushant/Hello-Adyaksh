"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import nepalFlagIcon from "@/public/nepal-flag-icon.webp";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  Bell,
  FileText,
  MessageSquareWarning,
  Phone,
  Image as ImageIcon,
  BarChart3,
  Hammer,
  Settings,
} from "lucide-react";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/notices", label: t("notices"), icon: Bell },
    { href: "/blogs", label: t("blogs"), icon: FileText },
    { href: "/complaints", label: t("complaints"), icon: MessageSquareWarning },
    { href: "/development", label: t("development"), icon: Hammer },
    { href: "/gallery", label: t("gallery"), icon: ImageIcon },
    { href: "/reports", label: t("reports"), icon: BarChart3 },
    { href: "/contact", label: t("contact"), icon: Phone },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 via-[#003893]/5 to-white/95 backdrop-blur-md transform-gpu [will-change:transform] border-b border-[#003893]/10 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-[#DC143C]/20 to-[#003893]/20 blur-sm group-hover:blur-md transition-all" />
              <div className="relative bg-white rounded-lg p-1.5 shadow-sm border border-[#003893]/10">
                <Image
                  src={nepalFlagIcon}
                  alt="Nepal Flag"
                  className="w-8 h-auto"
                />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
                Hello Mayor
              </h1>
              <p className="text-xs text-[#003893]/70 font-medium">
                {language === "en" ? "Portal" : "पोर्टल"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#003893]/80 hover:text-[#DC143C] transition-all rounded-lg group"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
                <motion.div
                  className="absolute inset-0 rounded-lg bg-[#DC143C]/5 opacity-0 group-hover:opacity-100"
                  layoutId="navHover"
                  transition={{ type: "spring", duration: 0.3 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center rounded-full bg-gradient-to-r from-[#003893]/5 to-[#DC143C]/5 p-1 border border-[#003893]/10">
              <button
                onClick={() => setLanguage("en")}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  language === "en"
                    ? "text-white"
                    : "text-[#003893]/70 hover:text-[#003893]"
                }`}
              >
                {language === "en" && (
                  <motion.div
                    layoutId="langToggle"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#DC143C] to-[#003893]"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">EN</span>
              </button>
              <button
                onClick={() => setLanguage("ne")}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  language === "ne"
                    ? "text-white"
                    : "text-[#003893]/70 hover:text-[#003893]"
                }`}
              >
                {language === "ne" && (
                  <motion.div
                    layoutId="langToggle"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#DC143C] to-[#003893]"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">NE</span>
              </button>
            </div>

            {/* Admin Link */}
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 border-[#003893]/20 hover:border-[#DC143C] hover:bg-[#DC143C]/5 text-[#003893] hover:text-[#DC143C] transition-all"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">{t("admin")}</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#003893]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gradient-to-b from-white to-[#003893]/5 border-t border-[#003893]/10"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#003893]/80 hover:text-[#DC143C] transition-colors rounded-xl hover:bg-[#DC143C]/5"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white transition-colors rounded-xl bg-gradient-to-r from-[#DC143C] to-[#003893] mt-2"
                >
                  <Settings className="h-5 w-5" />
                  {t("admin")}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
