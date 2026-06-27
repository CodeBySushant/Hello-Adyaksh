"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Download,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Report {
  id: number
  title_en: string
  title_np: string | null
  description_en: string | null
  description_np: string | null
  report_type: string
  fiscal_year: string
  file_url: string
  file_size: number
  download_count: number
  is_published: boolean
  published_at: string | null
  created_at: string
}

type FormData = Omit<Report, "id" | "download_count" | "published_at" | "created_at">

const EMPTY_FORM: FormData = {
  title_en: "",
  title_np: "",
  description_en: "",
  description_np: "",
  report_type: "",
  fiscal_year: "",
  file_url: "",
  file_size: 0,
  is_published: false,
}

const REPORT_TYPES = [
  { value: "budget", label: "Budget" },
  { value: "development", label: "Development" },
  { value: "census", label: "Census" },
  { value: "audit", label: "Audit" },
  { value: "annual", label: "Annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "other", label: "Other" },
]

const FISCAL_YEARS = [
  "2081-82", "2080-81", "2079-80", "2078-79", "2077-78", "2081", "2080", "2079",
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const formatFileSize = (bytes: number) => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const typeColor: Record<string, string> = {
  budget: "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-green-50 text-green-700 border-green-200",
  census: "bg-purple-50 text-purple-700 border-purple-200",
  audit: "bg-amber-50 text-amber-700 border-amber-200",
  annual: "bg-indigo-50 text-indigo-700 border-indigo-200",
  quarterly: "bg-cyan-50 text-cyan-700 border-cyan-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
}

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [deletingReport, setDeletingReport] = useState<Report | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, mutate } = useSWR<{ success: boolean; data: Report[] }>(
    "/api/reports?admin=true",
    fetcher
  )
  const reports = data?.data || []

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.title_np ?? "").includes(searchQuery)
    const matchType = typeFilter === "all" || r.report_type === typeFilter
    return matchSearch && matchType
  })

  // ── Helpers ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingReport(null)
    setFormData(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const openEdit = (report: Report) => {
    setEditingReport(report)
    setFormData({
      title_en: report.title_en,
      title_np: report.title_np ?? "",
      description_en: report.description_en ?? "",
      description_np: report.description_np ?? "",
      report_type: report.report_type,
      fiscal_year: report.fiscal_year,
      file_url: report.file_url,
      file_size: report.file_size,
      is_published: report.is_published,
    })
    setIsFormOpen(true)
  }

  const openDelete = (report: Report) => {
    setDeletingReport(report)
    setIsDeleteOpen(true)
  }

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // ── Submit (Create / Update) ────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.title_en.trim() || !formData.report_type || !formData.fiscal_year || !formData.file_url.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        file_size: Number(formData.file_size) || 0,
        ...(editingReport ? { id: editingReport.id } : {}),
      }

      const res = await fetch("/api/reports", {
        method: editingReport ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save report")
      }

      toast.success(editingReport ? "Report updated successfully!" : "Report created successfully!")
      setIsFormOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingReport) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/reports?id=${deletingReport.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete")
      toast.success("Report deleted.")
      setIsDeleteOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Quick toggle publish ────────────────────────────────────
  const togglePublish = async (report: Report) => {
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...report, is_published: !report.is_published }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error)
      toast.success(report.is_published ? "Report unpublished." : "Report published!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle publish status")
    }
  }

  // ── Stats ───────────────────────────────────────────────────
  const totalReports = reports.length
  const publishedCount = reports.filter((r) => r.is_published).length
  const draftCount = totalReports - publishedCount
  const totalDownloads = reports.reduce((sum, r) => sum + (r.download_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">Reports Management</h1>
          <p className="text-muted-foreground text-sm">Upload, edit, and manage ward reports</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: totalReports, color: "text-[#003893]", bg: "bg-[#003893]/5" },
          { label: "Published", value: publishedCount, color: "text-green-600", bg: "bg-green-50" },
          { label: "Drafts", value: draftCount, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Downloads", value: totalDownloads, color: "text-[#DC143C]", bg: "bg-[#DC143C]/5" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className={`py-3 px-4 ${stat.bg} rounded-xl`}>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {REPORT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== "all" ? "No reports match your filters" : "No reports yet. Add one!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                layout
              >
                <Card className="hover:shadow-md transition-all h-full border-[#003893]/10">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#DC143C]/10 to-[#003893]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-[#003893]" />
                      </div>
                      <div className="flex gap-1">
                        {/* Publish toggle */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${report.is_published ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-amber-600"}`}
                          title={report.is_published ? "Unpublish" : "Publish"}
                          onClick={() => togglePublish(report)}
                        >
                          {report.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#003893] hover:text-[#003893]/80"
                          onClick={() => openEdit(report)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => openDelete(report)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-[#003893] text-sm mb-1 line-clamp-2 flex-1">
                      {report.title_en}
                    </h3>
                    {report.title_np && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{report.title_np}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                          typeColor[report.report_type] ?? typeColor.other
                        }`}
                      >
                        {report.report_type}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          report.is_published
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {report.is_published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-[#003893]/5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        FY {report.fiscal_year}
                      </span>
                      <span>{formatFileSize(report.file_size)}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {report.download_count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Create / Edit Dialog ───────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#003893]">
              {editingReport ? "Edit Report" : "Add New Report"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title EN */}
            <div className="grid gap-1.5">
              <Label htmlFor="title_en">
                Title (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setField("title_en", e.target.value)}
                placeholder="Annual Budget Report 2080-81"
              />
            </div>

            {/* Title NP */}
            <div className="grid gap-1.5">
              <Label htmlFor="title_np">Title (Nepali)</Label>
              <Input
                id="title_np"
                value={formData.title_np ?? ""}
                onChange={(e) => setField("title_np", e.target.value)}
                placeholder="वार्षिक बजेट प्रतिवेदन २०८०-८१"
              />
            </div>

            {/* Description EN */}
            <div className="grid gap-1.5">
              <Label htmlFor="desc_en">Description (English)</Label>
              <Textarea
                id="desc_en"
                rows={2}
                value={formData.description_en ?? ""}
                onChange={(e) => setField("description_en", e.target.value)}
                placeholder="Brief description of the report..."
              />
            </div>

            {/* Description NP */}
            <div className="grid gap-1.5">
              <Label htmlFor="desc_np">Description (Nepali)</Label>
              <Textarea
                id="desc_np"
                rows={2}
                value={formData.description_np ?? ""}
                onChange={(e) => setField("description_np", e.target.value)}
                placeholder="प्रतिवेदनको संक्षिप्त विवरण..."
              />
            </div>

            {/* Type + Fiscal Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>
                  Report Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.report_type} onValueChange={(v) => setField("report_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.fiscal_year} onValueChange={(v) => setField("fiscal_year", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {FISCAL_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File URL + Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="file_url">
                  File URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setField("file_url", e.target.value)}
                  placeholder="/reports/budget-2080-81.pdf"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="file_size">File Size (bytes)</Label>
                <Input
                  id="file_size"
                  type="number"
                  min={0}
                  value={formData.file_size || ""}
                  onChange={(e) => setField("file_size", Number(e.target.value))}
                  placeholder="2400000"
                />
              </div>
            </div>

            {/* Publish toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#003893]/5 border border-[#003893]/10">
              <div>
                <p className="text-sm font-medium text-[#003893]">Publish immediately</p>
                <p className="text-xs text-muted-foreground">
                  Published reports are visible to the public
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_published}
                onClick={() => setField("is_published", !formData.is_published)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#003893]/20 ${
                  formData.is_published ? "bg-[#003893]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    formData.is_published ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingReport ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Update Report
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !isDeleting && setIsDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deletingReport?.title_en}"</strong> will be permanently deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" /> Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}