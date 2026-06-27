"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileText,
  Building2,
  Droplets,
  Zap,
  Trash2,
  UserCheck,
  MoreHorizontal,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const categories = [
  { id: "infrastructure", icon: Building2, labelEn: "Infrastructure", labelNe: "पूर्वाधार" },
  { id: "water_supply", icon: Droplets, labelEn: "Water Supply", labelNe: "खानेपानी" },
  { id: "electricity", icon: Zap, labelEn: "Electricity", labelNe: "विद्युत" },
  { id: "sanitation", icon: Trash2, labelEn: "Sanitation", labelNe: "सरसफाई" },
  { id: "public_service", icon: UserCheck, labelEn: "Public Service", labelNe: "सार्वजनिक सेवा" },
  { id: "other", icon: MoreHorizontal, labelEn: "Other", labelNe: "अन्य" },
]

const COLORS = ["#DC143C", "#003893", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]

interface ComplaintStats {
  total: number
  pending: number
  in_progress: number
  resolved: number
}

export default function ComplaintsPage() {
  const { t, language } = useLanguage()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    subject: "",
    description: "",
    priority: "medium",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [trackingId, setTrackingId] = useState("")
  const [trackingResult, setTrackingResult] = useState<Record<string, unknown> | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/statistics")
      const data = await res.json()
      if (data.success) {
        setStats(data.data.complaints)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const chartData = stats ? [
    { name: language === "en" ? "Pending" : "विचाराधीन", value: Number(stats.pending) || 0, color: "#FF6B6B" },
    { name: language === "en" ? "In Progress" : "प्रगतिमा", value: Number(stats.in_progress) || 0, color: "#003893" },
    { name: language === "en" ? "Resolved" : "समाधान", value: Number(stats.resolved) || 0, color: "#4ECDC4" },
  ].filter(item => item.value > 0) : []

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setTicketNumber(data.trackingId)
        setShowSuccess(true)
        fetchStats()
      } else {
        alert(data.error || "Failed to submit complaint")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTrackComplaint = async () => {
    if (!trackingId.trim()) return
    
    setIsTracking(true)
    setTrackingResult(null)
    
    try {
      const res = await fetch(`/api/complaints?trackingId=${encodeURIComponent(trackingId)}`)
      const data = await res.json()
      
      if (data.success && data.data.length > 0) {
        setTrackingResult(data.data[0])
      } else {
        setTrackingResult({ error: true })
      }
    } catch (error) {
      console.error("Tracking error:", error)
      setTrackingResult({ error: true })
    } finally {
      setIsTracking(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      subject: "",
      description: "",
      priority: "medium",
    })
    setFile(null)
    setStep(1)
    setShowSuccess(false)
  }

  const steps = [
    { num: 1, label: language === "en" ? "Personal Info" : "व्यक्तिगत जानकारी" },
    { num: 2, label: language === "en" ? "Category" : "वर्ग" },
    { num: 3, label: language === "en" ? "Details" : "विवरण" },
    { num: 4, label: language === "en" ? "Review" : "समीक्षा" },
  ]

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.phone
      case 2:
        return formData.category
      case 3:
        return formData.subject && formData.description
      default:
        return true
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; ne: string }> = {
      pending: { en: "Pending", ne: "विचाराधीन" },
      in_progress: { en: "In Progress", ne: "प्रगतिमा" },
      resolved: { en: "Resolved", ne: "समाधान भयो" },
    }
    return statusMap[status]?.[language] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gradient-nepal mb-4">
              {language === "en" ? "File a Complaint" : "गुनासो दर्ता गर्नुहोस्"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Submit your complaints and track their status. We are committed to resolving your issues promptly."
                : "आफ्नो गुनासो पेश गर्नुहोस् र तिनीहरूको स्थिति ट्र्याक गर्नुहोस्। हामी तपाईंको समस्या छिटो समाधान गर्न प्रतिबद्ध छौं।"}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-8"
              >
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {steps.map((s, i) => (
                      <div key={s.num} className="flex items-center">
                        <motion.div
                          animate={{
                            scale: step === s.num ? 1.1 : 1,
                            backgroundColor: step >= s.num ? "#DC143C" : "#E5E7EB",
                          }}
                          className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                        >
                          {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                        </motion.div>
                        {i < steps.length - 1 && (
                          <div
                            className={`hidden sm:block h-1 w-16 lg:w-24 mx-2 rounded ${
                              step > s.num ? "bg-[#DC143C]" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground">{steps[step - 1].label}</p>
                </div>

                {/* Form Steps */}
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="name">{t("fullName")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={language === "en" ? "Enter your full name" : "पूरा नाम लेख्नुहोस्"}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={language === "en" ? "your@email.com" : "तपाईंको@इमेल.com"}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("phone")} *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={language === "en" ? "98XXXXXXXX" : "९८XXXXXXXX"}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">{language === "en" ? "Address" : "ठेगाना"}</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={language === "en" ? "Your address" : "तपाईंको ठेगाना"}
                          className="mt-1.5"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Label className="mb-4 block">
                        {language === "en" ? "Select Category" : "वर्ग छान्नुहोस्"} *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                          <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`p-6 rounded-xl border-2 transition-all text-center ${
                              formData.category === cat.id
                                ? "border-[#DC143C] bg-[#DC143C]/5"
                                : "border-border hover:border-[#003893]/50"
                            }`}
                          >
                            <cat.icon
                              className={`h-8 w-8 mx-auto mb-2 ${
                                formData.category === cat.id ? "text-[#DC143C]" : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                formData.category === cat.id ? "text-[#DC143C]" : "text-foreground"
                              }`}
                            >
                              {language === "en" ? cat.labelEn : cat.labelNe}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="subject">{t("subject")} *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={language === "en" ? "Brief subject of your complaint" : "गुनासोको संक्षिप्त विषय"}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">{t("description")} *</Label>
                        <Textarea
                          id="description"
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder={language === "en" ? "Describe your complaint in detail..." : "आफ्नो गुनासो विस्तृतमा वर्णन गर्नुहोस्..."}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>{t("attachFile")}</Label>
                        <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-[#003893]/50 transition-colors cursor-pointer">
                          <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                          <label htmlFor="file" className="cursor-pointer">
                            {file ? (
                              <div className="flex items-center justify-center gap-2">
                                <FileText className="h-5 w-5 text-[#003893]" />
                                <span className="text-sm font-medium">{file.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  {language === "en" ? "Click to upload or drag and drop" : "अपलोड गर्न क्लिक गर्नुहोस्"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF (Max 10MB)</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">
                        {language === "en" ? "Review Your Complaint" : "आफ्नो गुनासो समीक्षा गर्नुहोस्"}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">{t("fullName")}</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        {formData.email && (
                          <div className="flex justify-between py-3 border-b">
                            <span className="text-muted-foreground">{t("email")}</span>
                            <span className="font-medium">{formData.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">{t("phone")}</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                        {formData.address && (
                          <div className="flex justify-between py-3 border-b">
                            <span className="text-muted-foreground">{language === "en" ? "Address" : "ठेगाना"}</span>
                            <span className="font-medium">{formData.address}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">{t("category")}</span>
                          <span className="font-medium">
                            {language === "en"
                              ? categories.find((c) => c.id === formData.category)?.labelEn
                              : categories.find((c) => c.id === formData.category)?.labelNe}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">{t("subject")}</span>
                          <span className="font-medium">{formData.subject}</span>
                        </div>
                        <div className="py-3">
                          <span className="text-muted-foreground block mb-2">{t("description")}</span>
                          <p className="text-sm bg-muted p-3 rounded-lg">{formData.description}</p>
                        </div>
                        {file && (
                          <div className="flex justify-between py-3 border-t">
                            <span className="text-muted-foreground">{t("attachFile")}</span>
                            <span className="font-medium">{file.name}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === "en" ? "Back" : "पछाडि"}
                  </Button>
                  {step < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="rounded-full gradient-nepal"
                    >
                      {language === "en" ? "Next" : "अर्को"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-full gradient-nepal"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("submitting")}
                        </>
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Track Complaint */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">
                  {language === "en" ? "Track Your Complaint" : "आफ्नो गुनासो ट्र्याक गर्नुहोस्"}
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={language === "en" ? "Enter Tracking ID" : "ट्र्याकिङ ID लेख्नुहोस्"}
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                  />
                  <Button
                    onClick={handleTrackComplaint}
                    disabled={isTracking}
                    className="gradient-nepal shrink-0"
                  >
                    {isTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                {trackingResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    {(trackingResult as { error?: boolean }).error ? (
                      <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                        {language === "en" ? "Complaint not found" : "गुनासो फेला परेन"}
                      </div>
                    ) : (
                      <div className="p-4 bg-muted rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {language === "en" ? "Status" : "स्थिति"}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon((trackingResult as { status: string }).status)}
                            <span className="font-medium">
                              {getStatusText((trackingResult as { status: string }).status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {language === "en" ? "Subject" : "विषय"}
                          </span>
                          <span className="font-medium text-sm">
                            {(trackingResult as { subject: string }).subject}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {language === "en" ? "Submitted" : "पेश गरिएको"}
                          </span>
                          <span className="font-medium text-sm">
                            {new Date((trackingResult as { created_at: string }).created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Stats */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">
                  {language === "en" ? "Complaint Statistics" : "गुनासो तथ्याङ्क"}
                </h3>
                {chartData.length > 0 ? (
                  <>
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-xl font-bold text-amber-600">{stats?.pending || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "en" ? "Pending" : "विचाराधीन"}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-xl font-bold text-blue-600">{stats?.in_progress || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "en" ? "In Progress" : "प्रगतिमा"}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl">
                        <p className="text-xl font-bold text-green-600">{stats?.resolved || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "en" ? "Resolved" : "समाधान"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === "en" ? "No complaints yet" : "अहिलेसम्म कुनै गुनासो छैन"}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">
                  {language === "en" ? "Important Information" : "महत्त्वपूर्ण जानकारी"}
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {language === "en"
                      ? "Complaints are typically resolved within 7-14 working days"
                      : "गुनासोहरू सामान्यतया ७-१४ कार्य दिनभित्र समाधान हुन्छन्"}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {language === "en"
                      ? "You will receive SMS/email updates on your complaint status"
                      : "तपाईंले आफ्नो गुनासोको स्थितिमा SMS/इमेल अपडेटहरू प्राप्त गर्नुहुनेछ"}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {language === "en"
                      ? "Keep your tracking ID safe for future reference"
                      : "भविष्यको सन्दर्भको लागि आफ्नो ट्र्याकिङ ID सुरक्षित राख्नुहोस्"}
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="mx-auto mb-4"
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              </motion.div>
              {language === "en" ? "Complaint Submitted Successfully!" : "गुनासो सफलतापूर्वक पेश भयो!"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {language === "en"
                ? "Your complaint has been registered. Please save your tracking ID:"
                : "तपाईंको गुनासो दर्ता भएको छ। कृपया आफ्नो ट्र्याकिङ ID बचत गर्नुहोस्:"}
            </p>
            <div className="bg-muted p-4 rounded-xl">
              <p className="text-2xl font-bold text-[#DC143C]">{ticketNumber}</p>
            </div>
            <Button onClick={resetForm} className="w-full gradient-nepal rounded-full">
              {language === "en" ? "Submit Another Complaint" : "अर्को गुनासो पेश गर्नुहोस्"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
