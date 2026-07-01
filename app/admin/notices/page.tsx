"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Calendar,
  AlertCircle,
  Upload,
  FileText,
  X,
} from "lucide-react";
import useSWR, { mutate } from "swr";

interface Notice {
  id: number;
  title_en: string;
  title_np: string | null;
  content_en: string;
  content_np: string | null;
  category: string | null;
  is_important: boolean;
  attachment_url: string | null;
  publish_date: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminNoticesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [attachPdf, setAttachPdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_np: "",
    content_en: "",
    content_np: "",
    category: "announcement",
    is_important: false,
    attachment_url: "",
  });

  const { data, isLoading } = useSWR<{ success: boolean; data: Notice[] }>(
    "/api/notices",
    fetcher,
  );

  const notices = data?.data || [];

  const filteredNotices = notices.filter((notice) =>
    notice.title_en.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // When the "Attach PDF" toggle is off, send an empty string so the
      // attachment is cleared (and no download button shows on the public side).
      const payload = {
        ...formData,
        attachment_url: attachPdf ? formData.attachment_url : "",
        ...(editingNotice ? { id: editingNotice.id } : {}),
      };

      const res = await fetch("/api/notices", {
        method: editingNotice ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        setIsAddDialogOpen(false);
        setEditingNotice(null);
        setAttachPdf(false);
        setFormData({
          title_en: "",
          title_np: "",
          content_en: "",
          content_np: "",
          category: "announcement",
          is_important: false,
          attachment_url: "",
        });
        mutate("/api/notices");
      }
    } catch (error) {
      console.error("Error creating notice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setAttachPdf(!!notice.attachment_url);
    setFormData({
      title_en: notice.title_en,
      title_np: notice.title_np || "",
      content_en: notice.content_en,
      content_np: notice.content_np || "",
      category: notice.category || "announcement",
      is_important: notice.is_important,
      attachment_url: notice.attachment_url || "",
    });
    setIsAddDialogOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/notices/upload", { method: "POST", body });
      const result = await res.json();

      if (result.success) {
        setFormData((prev) => ({ ...prev, attachment_url: result.url }));
      } else {
        alert(result.error || "Upload failed.");
      }
    } catch (error) {
      console.error("PDF upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notice?")) return;

    await fetch(`/api/notices?id=${id}`, {
      method: "DELETE",
    });

    mutate("/api/notices");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">
            Notices Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage ward notices and announcements
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingNotice(null);
              setAttachPdf(false);
              setFormData({
                title_en: "",
                title_np: "",
                content_en: "",
                content_np: "",
                category: "announcement",
                is_important: false,
                attachment_url: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotice ? "Edit Notice" : "Create New Notice"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Nepali)</Label>
                  <Input
                    value={formData.title_np}
                    onChange={(e) =>
                      setFormData({ ...formData, title_np: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content (English)</Label>
                  <Textarea
                    value={formData.content_en}
                    onChange={(e) =>
                      setFormData({ ...formData, content_en: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (Nepali)</Label>
                  <Textarea
                    value={formData.content_np}
                    onChange={(e) =>
                      setFormData({ ...formData, content_np: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="services">Services</option>
                    <option value="health">Health</option>
                    <option value="education">Education</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div className="flex items-center justify-between space-y-2 pt-6">
                  <Label>Mark as Important</Label>
                  <Switch
                    checked={formData.is_important}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_important: checked })
                    }
                  />
                </div>
              </div>
              {/* Attach PDF — toggle first; the uploader only appears when on */}
              <div className="rounded-lg border border-input p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Attach PDF</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Turn on only if this notice needs a downloadable PDF
                    </p>
                  </div>
                  <Switch
                    checked={attachPdf}
                    onCheckedChange={(checked) => {
                      setAttachPdf(checked);
                      // Clearing the url when turned off removes the public
                      // download button on save.
                      if (!checked) {
                        setFormData({ ...formData, attachment_url: "" });
                      }
                    }}
                  />
                </div>

                {attachPdf &&
                  (formData.attachment_url ? (
                    <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
                      <a
                        href={formData.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#003893] hover:underline truncate"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {formData.attachment_url.split("/").pop()}
                        </span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 shrink-0"
                        onClick={() =>
                          setFormData({ ...formData, attachment_url: "" })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        id="notice-pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="notice-pdf"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-3 text-sm text-muted-foreground hover:border-[#003893] hover:text-[#003893] transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload PDF (max 15MB)
                          </>
                        )}
                      </Label>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingNotice ? "Update Notice" : "Create Notice"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No notices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.is_important && (
                          <Badge className="bg-[#DC143C] text-white">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Important
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {notice.category}
                        </Badge>
                        {notice.attachment_url && (
                          <Badge
                            variant="outline"
                            className="border-[#003893]/30 text-[#003893]"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            PDF
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#003893] mb-1">
                        {notice.title_en}
                      </h3>
                      {notice.title_np && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {notice.title_np}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notice.content_en}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(notice.publish_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(notice)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(notice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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