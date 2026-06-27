"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Mail,
  Bell,
  FileText,
  Hammer,
  Image,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard",
    labelNe: "ड्यासबोर्ड",
  },
  {
    href: "/admin/complaints",
    icon: MessageSquareWarning,
    label: "Complaints",
    labelNe: "गुनासो",
  },
  { href: "/admin/messages", icon: Mail, label: "Messages", labelNe: "सन्देश" },
  { href: "/admin/notices", icon: Bell, label: "Notices", labelNe: "सूचना" },
  { href: "/admin/blogs", icon: FileText, label: "Blogs", labelNe: "ब्लग" },
  {
    href: "/admin/works",
    icon: Hammer,
    label: "Dev Works",
    labelNe: "विकास कार्य",
  },
  { href: "/admin/gallery", icon: Image, label: "Gallery", labelNe: "ग्यालरी" },
  {
    href: "/admin/reports",
    icon: BarChart3,
    label: "Reports",
    labelNe: "प्रतिवेदन",
  },
];

// ─── Change Password Dialog ───────────────────────────────────────────────────

function ChangePasswordDialog({
  open,
  onOpenChange,
  language,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: "en" | "ne";
}) {
  const t = (en: string, ne: string) => (language === "en" ? en : ne);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("All fields are required.", "सबै फिल्ड आवश्यक छन्।"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(
        t(
          "New password must be at least 8 characters.",
          "नयाँ पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ।",
        ),
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(
        t("New passwords do not match.", "नयाँ पासवर्डहरू मेल खाँदैनन्।"),
      );
      return;
    }
    if (currentPassword === newPassword) {
      toast.error(
        t(
          "New password must be different from the current one.",
          "नयाँ पासवर्ड हालको भन्दा फरक हुनुपर्छ।",
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      // The endpoint returns JSON. If it returns HTML instead (e.g. a 404 page
      // when the route isn't registered), res.json() throws a cryptic
      // "Unexpected token '<'" error — so read text first and parse defensively.
      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(
          res.status === 404
            ? t(
                "Endpoint not found. Ensure app/api/admin/change-password/route.ts exists and restart the server.",
                "एन्डपोइन्ट भेटिएन। app/api/admin/change-password/route.ts छ कि जाँच गर्नुहोस् र सर्भर पुनः सुरु गर्नुहोस्।",
              )
            : t(
                `Unexpected server response (HTTP ${res.status}).`,
                `अप्रत्याशित सर्भर प्रतिक्रिया (HTTP ${res.status})।`,
              ),
        );
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to change password");
      }

      toast.success(
        t("Password updated successfully!", "पासवर्ड सफलतापूर्वक अपडेट भयो!"),
      );
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t("Something went wrong", "केहि गडबड भयो"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (isSubmitting) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#003893] flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t("Change Password", "पासवर्ड परिवर्तन")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Enter your current password and choose a new one.",
              "आफ्नो हालको पासवर्ड प्रविष्ट गर्नुहोस् र नयाँ छान्नुहोस्।",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-password">
              {t("Current Password", "हालको पासवर्ड")}
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password">
              {t("New Password", "नयाँ पासवर्ड")}
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("At least 8 characters", "कम्तिमा ८ अक्षर")}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">
              {t("Confirm New Password", "नयाँ पासवर्ड पुष्टि गर्नुहोस्")}
            </Label>
            <Input
              id="confirm-password"
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">
                {t("Passwords do not match", "पासवर्डहरू मेल खाँदैनन्")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("Cancel", "रद्द गर्नुहोस्")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("Updating...", "अपडेट हुँदै...")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("Update Password", "पासवर्ड अपडेट गर्नुहोस्")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwDialogOpen, setPwDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 h-16 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-[#003893]">Admin Panel</span>
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg gradient-nepal flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[#003893]">
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground">Ward Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "gradient-nepal text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {language === "en" ? item.label : item.labelNe}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            {/* Language Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-muted">
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  language === "en"
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("ne")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  language === "ne"
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                नेपाली
              </button>
            </div>

            {/* Change Password */}
            <Button
              variant="outline"
              className="w-full justify-start"
              size="sm"
              onClick={() => {
                setSidebarOpen(false);
                setPwDialogOpen(true);
              }}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              {language === "en" ? "Change Password" : "पासवर्ड परिवर्तन"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              size="sm"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {language === "en" ? "Logout" : "बाहिर निस्कनुहोस्"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-muted/30">
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={pwDialogOpen}
        onOpenChange={setPwDialogOpen}
        language={language}
      />
    </div>
  );
}