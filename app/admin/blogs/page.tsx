"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Eye,
  Calendar,
  Star,
  Upload,
  X,
  Image as ImageIcon,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { compressImage, formatBytes, getCompressionSavings } from "@/lib/compress-image";

interface Blog {
  id: number;
  title_en: string;
  title_np: string | null;
  slug: string;
  excerpt_en: string | null;
  content_en?: string;
  cover_image_url: string | null;
  author_name: string | null;
  category: string | null;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  published_at: string;
}

interface FormData {
  title_en: string;
  title_np: string;
  excerpt_en: string;
  content_en: string;
  author_name: string;
  category: string;
  is_featured: boolean;
  is_published: boolean;
  slug: string;
  cover_image_url: string;
}

const EMPTY_FORM: FormData = {
  title_en: "",
  title_np: "",
  excerpt_en: "",
  content_en: "",
  author_name: "",
  category: "",
  is_featured: false,
  is_published: true,
  slug: "",
  cover_image_url: "",
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

export default function AdminBlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [compressedCover, setCompressedCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [compressionInfo, setCompressionInfo] = useState("")
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useSWR<{ success: boolean; data: Blog[] }>(
    "/api/blogs",
    fetcher,
  );
  const blogs = data?.data || [];
  const filteredBlogs = blogs.filter((blog) =>
    blog.title_en.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const clearCover = () => {
    setCoverFile(null)
    setCompressedCover(null)
    setCoverPreview(null)
    setCompressionInfo("")
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images allowed for cover.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image too large. Max 10MB.")
      return
    }

    setCoverFile(file)
    setCompressionInfo("")

    // Instant preview
    const reader = new FileReader()
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Compress
    setIsCompressing(true)
    try {
      // Blog covers: smaller target — 1200x630 (OG image standard)
      const compressed = await compressImage(file, 1200, 630, 0.85, 0.5)
      setCompressedCover(compressed)
      const info = getCompressionSavings(file, compressed)
      if (info) setCompressionInfo(info)

      // Update preview with compressed
      const compReader = new FileReader()
      compReader.onload = (ev) => setCoverPreview(ev.target?.result as string)
      compReader.readAsDataURL(compressed)
    } catch {
      setCompressedCover(file)
      toast.warning("Compression failed, using original.")
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog?")) return;
    const res = await fetch(`/api/blogs?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Blog deleted.");
    mutate("/api/blogs");
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title_en: blog.title_en,
      title_np: blog.title_np ?? "",
      excerpt_en: blog.excerpt_en ?? "",
      content_en: blog.content_en ?? "",
      author_name: blog.author_name ?? "",
      category: blog.category ?? "",
      is_featured: blog.is_featured,
      is_published: blog.is_published,
      slug: blog.slug,
      cover_image_url: blog.cover_image_url ?? "",
    });
    clearCover()
    if (blog.cover_image_url) {
      setCoverPreview(blog.cover_image_url)
    }
    setIsOpen(true);
  };

  const openCreate = () => {
    setEditingBlog(null)
    setFormData(EMPTY_FORM)
    clearCover()
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title_en.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      let coverImageUrl = formData.cover_image_url

      // Upload cover image if a new one was selected
      if (compressedCover) {
        setIsUploadingCover(true)
        const uploadForm = new FormData()
        uploadForm.append("file", compressedCover)

        const uploadRes = await fetch("/api/gallery/upload", {
          method: "POST",
          body: uploadForm,
        })
        const uploadData = await uploadRes.json()
        setIsUploadingCover(false)

        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || "Cover image upload failed")
        }
        coverImageUrl = uploadData.url
      }

      const payload = {
        ...formData,
        cover_image_url: coverImageUrl || null,
        ...(editingBlog ? { id: editingBlog.id } : {}),
      }

      const res = await fetch("/api/blogs", {
        method: editingBlog ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save blog")
      }

      toast.success(editingBlog ? "Blog updated!" : "Blog created!")
      mutate("/api/blogs");
      setIsOpen(false);
      setEditingBlog(null);
      setFormData(EMPTY_FORM);
      clearCover()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false);
      setIsUploadingCover(false)
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">Blogs Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Form Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#003893]">
                {editingBlog ? "Edit Blog" : "Create Blog"}
              </h2>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#003893]/20">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover"
                    />
                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white text-sm flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Compressing...
                        </div>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full"
                      onClick={clearCover}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {compressionInfo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-xs p-2 flex items-center gap-1">
                        <Minimize2 className="h-3 w-3" />
                        {compressionInfo}
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    htmlFor="cover-upload"
                    className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-[#003893]/20 hover:border-[#003893]/50 cursor-pointer transition-colors bg-muted/30"
                  >
                    <ImageIcon className="h-7 w-7 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-[#003893]">Upload cover image</p>
                    <p className="text-xs text-muted-foreground">Auto-compressed to 1200×630 • JPEG/PNG/WebP</p>
                    <input
                      id="cover-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input
                  placeholder="Blog title"
                  value={formData.title_en}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title_en: title,
                      slug: generateSlug(title),
                    }));
                  }}
                />
              </div>

              {/* Title NP */}
              <div className="space-y-1.5">
                <Label>Title (Nepali)</Label>
                <Input
                  placeholder="ब्लग शीर्षक"
                  value={formData.title_np}
                  onChange={(e) => setField("title_np", e.target.value)}
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label>Slug (auto-generated)</Label>
                <Input
                  placeholder="blog-post-slug"
                  value={formData.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <textarea
                  placeholder="Short summary shown in listings..."
                  className="w-full border rounded-lg p-2 text-sm min-h-[80px] resize-none"
                  value={formData.excerpt_en}
                  onChange={(e) => setField("excerpt_en", e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label>Content *</Label>
                <textarea
                  placeholder="Full blog content..."
                  className="w-full border rounded-lg p-2 text-sm min-h-[150px] resize-y"
                  value={formData.content_en}
                  onChange={(e) => setField("content_en", e.target.value)}
                />
              </div>

              {/* Author + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Author Name</Label>
                  <Input
                    placeholder="Ward Secretary"
                    value={formData.author_name}
                    onChange={(e) => setField("author_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    placeholder="development, finance..."
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value)}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#003893]/5 border border-[#003893]/10">
                  <Label className="text-sm">Featured</Label>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setField("is_featured", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#003893]/5 border border-[#003893]/10">
                  <Label className="text-sm">Published</Label>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(v) => setField("is_published", v)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingBlog(null);
                    clearCover()
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isCompressing}
                  className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingCover ? "Uploading cover..." : "Saving..."}</>
                  ) : isCompressing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Compressing...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4 mr-2" />
                    {editingBlog ? "Update" : "Create"}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No blog posts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all h-full">
                {/* Cover image thumbnail */}
                {blog.cover_image_url && (
                  <div className="h-32 overflow-hidden rounded-t-xl">
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title_en}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {blog.is_featured && (
                        <Badge className="bg-amber-500 text-white">
                          <Star className="h-3 w-3 mr-1" />Featured
                        </Badge>
                      )}
                      <Badge variant={blog.is_published ? "default" : "secondary"}>
                        {blog.is_published ? "Published" : "Draft"}
                      </Badge>
                      {blog.category && (
                        <Badge variant="outline" className="capitalize">{blog.category}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#003893] mb-2 line-clamp-2">{blog.title_en}</h3>
                  {blog.excerpt_en && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{blog.excerpt_en}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(blog.published_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />{blog.view_count} views
                      </span>
                    </div>
                    {blog.author_name && (
                      <span className="text-[#003893]">By {blog.author_name}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}