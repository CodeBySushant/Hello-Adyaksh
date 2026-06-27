"use client";

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Video,
  Star,
  Upload,
  X,
  CheckCircle2,
  XCircle,
  Minimize2,
} from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"
import { compressImage, formatBytes, getCompressionSavings } from "@/lib/compress-image"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryItem {
  id: number
  title_en: string
  title_np: string | null
  description_en: string | null
  media_type: string
  media_url: string
  category: string | null
  is_featured: boolean
  event_date: string | null
}

interface FormData {
  title_en: string
  title_np: string
  description_en: string
  description_np: string
  category: string
  event_date: string
  is_featured: boolean
}

const EMPTY_FORM: FormData = {
  title_en: "",
  title_np: "",
  description_en: "",
  description_np: "",
  category: "general",
  event_date: "",
  is_featured: false,
}

const CATEGORIES = [
  { value: "general",     label: "General" },
  { value: "events",      label: "Events" },
  { value: "development", label: "Development" },
  { value: "meetings",    label: "Meetings" },
  { value: "community",   label: "Community" },
  { value: "health",      label: "Health" },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  // File state
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [compressionInfo, setCompressionInfo] = useState("")
  const [isCompressing, setIsCompressing] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const { data, isLoading, mutate } = useSWR<{ success: boolean; data: GalleryItem[] }>(
    "/api/gallery",
    fetcher
  )
  const items = data?.data || []
  const filteredItems = items.filter((i) =>
    i.title_en.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const clearFile = () => {
    setOriginalFile(null)
    setCompressedFile(null)
    setFilePreview(null)
    setCompressionInfo("")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/ogg",
    ]
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported file type.")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB.")
      return
    }

    setOriginalFile(file)
    setCompressionInfo("")

    // Preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setFilePreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      // Compress
      setIsCompressing(true)
      try {
        const compressed = await compressImage(file)
        setCompressedFile(compressed)
        const info = getCompressionSavings(file, compressed)
        if (info) setCompressionInfo(info)

        // Update preview with compressed version
        const compReader = new FileReader()
        compReader.onload = (ev) => setFilePreview(ev.target?.result as string)
        compReader.readAsDataURL(compressed)
      } catch {
        // Compression failed — use original
        setCompressedFile(file)
        toast.warning("Compression failed, using original file.")
      } finally {
        setIsCompressing(false)
      }
    } else {
      // Video — no compression
      setCompressedFile(file)
      setFilePreview(null)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormData(EMPTY_FORM)
    clearFile()
    setIsFormOpen(true)
  }

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title_en: item.title_en,
      title_np: item.title_np ?? "",
      description_en: item.description_en ?? "",
      description_np: "",
      category: item.category ?? "general",
      event_date: item.event_date ?? "",
      is_featured: item.is_featured,
    })
    clearFile()
    setIsFormOpen(true)
  }

  const openDelete = (item: GalleryItem) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!formData.title_en.trim()) {
      toast.error("Title (English) is required.")
      return
    }
    if (!editingItem && !compressedFile) {
      toast.error("Please select a file to upload.")
      return
    }

    setIsSubmitting(true)

    try {
      if (editingItem) {
        // Metadata-only update
        const res = await fetch(`/api/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title_en: formData.title_en,
            title_np: formData.title_np || null,
            description_en: formData.description_en || null,
            description_np: formData.description_np || null,
            category: formData.category,
            event_date: formData.event_date || null,
            is_featured: formData.is_featured,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || "Update failed")
        toast.success("Gallery item updated!")

      } else {
        // Upload compressed file
        setUploadProgress("Uploading file...")
        const uploadForm = new FormData()
        uploadForm.append("file", compressedFile!)

        const uploadRes = await fetch("/api/gallery/upload", {
          method: "POST",
          body: uploadForm,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || "Upload failed")
        }

        setUploadProgress("Saving to database...")
        const dbForm = new FormData()
        dbForm.append("title_en", formData.title_en)
        dbForm.append("title_np", formData.title_np)
        dbForm.append("description_en", formData.description_en)
        dbForm.append("description_np", formData.description_np)
        dbForm.append("category", formData.category)
        dbForm.append("event_date", formData.event_date)
        dbForm.append("is_featured", String(formData.is_featured))
        dbForm.append("media_url", uploadData.url)
        dbForm.append("media_type", uploadData.media_type)

        const dbRes = await fetch("/api/gallery", {
          method: "POST",
          body: dbForm,
        })
        const dbData = await dbRes.json()
        if (!dbRes.ok || !dbData.success) throw new Error(dbData.error || "DB save failed")

        toast.success("Media uploaded successfully!")
      }

      setIsFormOpen(false)
      setUploadProgress("")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
      setUploadProgress("")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/gallery/${deletingItem.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed")
      toast.success("Item deleted.")
      setIsDeleteOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">Gallery Management</h1>
          <p className="text-muted-foreground">Upload and manage media files</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No media found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="overflow-hidden group hover:shadow-md transition-all">
                  <div className="relative aspect-square bg-gradient-to-br from-[#003893]/10 to-[#DC143C]/10 overflow-hidden">
                    {item.media_type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-10 w-10 text-[#003893]/40" />
                      </div>
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.title_en}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    )}
                    {item.is_featured && (
                      <span className="absolute top-2 left-2 p-1 bg-amber-500 rounded-full">
                        <Star className="h-3 w-3 text-white" />
                      </span>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="secondary" size="icon" className="h-7 w-7 shadow" onClick={() => openEdit(item)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-7 w-7 shadow text-red-500" onClick={() => openDelete(item)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-[#003893] line-clamp-1">{item.title_en}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{item.category || "general"}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.media_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Upload / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#003893]">
              {editingItem ? "Edit Media Item" : "Upload New Media"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* File picker — create only */}
            {!editingItem && (
              <div className="space-y-2">
                <Label>File <span className="text-red-500">*</span></Label>

                {originalFile ? (
                  <div className="rounded-xl border border-[#003893]/20 overflow-hidden">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center bg-muted gap-2">
                        <Video className="h-10 w-10 text-[#003893]/40" />
                        <p className="text-sm text-muted-foreground">{originalFile.name}</p>
                      </div>
                    )}

                    {/* Compression status */}
                    <div className="p-2 bg-muted/80 space-y-1">
                      {isCompressing ? (
                        <div className="flex items-center gap-2 text-xs text-[#003893]">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Compressing image...
                        </div>
                      ) : compressionInfo ? (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Minimize2 className="h-3 w-3" />
                          {compressionInfo}
                        </div>
                      ) : (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="truncate max-w-[70%]">{originalFile.name}</span>
                          <span>{formatBytes(originalFile.size)}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-none text-muted-foreground hover:text-red-500 h-8 text-xs"
                      onClick={clearFile}
                    >
                      <X className="h-3 w-3 mr-1" /> Remove file
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-[#003893]/20 hover:border-[#003893]/50 cursor-pointer transition-colors bg-muted/30"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-[#003893]">Click to select file</p>
                    <p className="text-xs text-muted-foreground mt-1">Images auto-compressed • Max 50MB</p>
                    <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF, MP4, WebM</p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Title EN */}
            <div className="space-y-1.5">
              <Label htmlFor="title_en">Title (English) <span className="text-red-500">*</span></Label>
              <Input id="title_en" value={formData.title_en} onChange={(e) => setField("title_en", e.target.value)} placeholder="Ward Meeting 2026" />
            </div>

            {/* Title NP */}
            <div className="space-y-1.5">
              <Label htmlFor="title_np">Title (Nepali)</Label>
              <Input id="title_np" value={formData.title_np} onChange={(e) => setField("title_np", e.target.value)} placeholder="वडा बैठक २०२६" />
            </div>

            {/* Description EN */}
            <div className="space-y-1.5">
              <Label htmlFor="desc_en">Description (English)</Label>
              <Input id="desc_en" value={formData.description_en} onChange={(e) => setField("description_en", e.target.value)} placeholder="Brief description..." />
            </div>

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event_date">Event Date</Label>
                <Input id="event_date" type="date" value={formData.event_date} onChange={(e) => setField("event_date", e.target.value)} />
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#003893]/5 border border-[#003893]/10">
              <div>
                <p className="text-sm font-medium text-[#003893]">Mark as Featured</p>
                <p className="text-xs text-muted-foreground">Featured items appear first in gallery</p>
              </div>
              <Switch checked={formData.is_featured} onCheckedChange={(v) => setField("is_featured", v)} />
            </div>

            {/* Upload progress */}
            {uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-[#003893] p-3 rounded-xl bg-[#003893]/5">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isCompressing}
              className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingItem ? "Saving..." : "Uploading..."}</>
              ) : isCompressing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Compressing...</>
              ) : editingItem ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Save Changes</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !isDeleting && setIsDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deletingItem?.title_en}"</strong> will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}