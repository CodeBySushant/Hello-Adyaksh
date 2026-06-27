"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Eye,
  Clock,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Tag,
  FileText,
  MapPin,
} from "lucide-react"
import { safeFormatDate } from "@/lib/date"

interface Complaint {
  id: number
  tracking_id: string
  name: string
  email: string
  phone: string
  address: string
  category: string
  subject: string
  description: string
  priority: string
  status: string
  admin_notes: string
  created_at: string
  updated_at: string
  resolved_at: string
}

const statusConfig = {
  pending: { label: "Pending", labelNe: "विचाराधीन", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  in_progress: { label: "In Progress", labelNe: "प्रक्रियामा", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  resolved: { label: "Resolved", labelNe: "समाधान", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
}

export default function AdminComplaintsPage() {
  const { language } = useLanguage()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [statusFilter])

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`/api/complaints?status=${statusFilter}`)
      const data = await res.json()
      if (data.success) {
        setComplaints(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, admin_notes: adminNotes }),
      })
      const data = await res.json()
      if (data.success) {
        setComplaints(complaints.map(c => c.id === id ? data.data : c))
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(data.data)
        }
      }
    } catch (error) {
      console.error("Failed to update complaint:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusStats = () => ({
    pending: complaints.filter(c => c.status === "pending").length,
    in_progress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  })

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gradient-nepal">
          {language === "en" ? "Complaints Management" : "गुनासो व्यवस्थापन"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === "en"
            ? "View and manage all citizen complaints"
            : "सबै नागरिक गुनासो हेर्नुहोस् र व्यवस्थापन गर्नुहोस्"}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search by name, subject, or ticket..." : "नाम, विषय वा टिकट खोज्नुहोस्..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "en" ? "All Status" : "सबै स्थिति"}</SelectItem>
            <SelectItem value="pending">{language === "en" ? "Pending" : "विचाराधीन"}</SelectItem>
            <SelectItem value="in_progress">{language === "en" ? "In Progress" : "प्रक्रियामा"}</SelectItem>
            <SelectItem value="resolved">{language === "en" ? "Resolved" : "समाधान भयो"}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {(["pending", "in_progress", "resolved"] as const).map((status) => {
          const config = statusConfig[status]
          return (
            <div
              key={status}
              className={`p-4 rounded-xl ${config.color.replace("text-", "bg-").replace("-700", "-50")}`}
            >
              <p className="text-2xl font-bold">{stats[status]}</p>
              <p className="text-xs text-muted-foreground">
                {language === "en" ? config.label : config.labelNe}
              </p>
            </div>
          )
        })}
      </motion.div>

      {/* Complaints Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "en" ? "Ticket" : "टिकट"}
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "en" ? "Complainant" : "गुनासोकर्ता"}
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  {language === "en" ? "Subject" : "विषय"}
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  {language === "en" ? "Category" : "वर्ग"}
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "en" ? "Status" : "स्थिति"}
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  {language === "en" ? "Date" : "मिति"}
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "en" ? "Actions" : "कार्य"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <AnimatePresence>
                {filteredComplaints.map((complaint, index) => {
                  const status = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending
                  return (
                    <motion.tr
                      key={complaint.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-[#003893]">
                          {complaint.tracking_id}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-sm">{complaint.name}</p>
                        <p className="text-xs text-muted-foreground">{complaint.email || complaint.phone}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm truncate max-w-xs">{complaint.subject}</p>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {complaint.category.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {language === "en" ? status.label : status.labelNe}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {safeFormatDate(new Date(complaint.created_at), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setAdminNotes(complaint.admin_notes || "")
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredComplaints.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {language === "en" ? "No complaints found" : "कुनै गुनासो फेला परेन"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{language === "en" ? "Complaint Details" : "गुनासो विवरण"}</span>
              {selectedComplaint && (
                <Badge className={statusConfig[selectedComplaint.status as keyof typeof statusConfig]?.color || statusConfig.pending.color}>
                  {language === "en"
                    ? statusConfig[selectedComplaint.status as keyof typeof statusConfig]?.label || "Pending"
                    : statusConfig[selectedComplaint.status as keyof typeof statusConfig]?.labelNe || "विचाराधीन"}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Ticket Number" : "टिकट नम्बर"}</p>
                <p className="font-mono font-bold text-[#003893]">{selectedComplaint.tracking_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {language === "en" ? "Email" : "इमेल"}
                  </p>
                  <p className="text-sm">{selectedComplaint.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {language === "en" ? "Phone" : "फोन"}
                  </p>
                  <p className="text-sm">{selectedComplaint.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {language === "en" ? "Category" : "वर्ग"}
                  </p>
                  <Badge variant="outline" className="capitalize">{selectedComplaint.category.replace("_", " ")}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {language === "en" ? "Date" : "मिति"}
                  </p>
                  <p className="text-sm">{safeFormatDate(new Date(selectedComplaint.created_at), "PPP")}</p>
                </div>
              </div>

              {selectedComplaint.address && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {language === "en" ? "Address" : "ठेगाना"}
                  </p>
                  <p className="text-sm">{selectedComplaint.address}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Subject" : "विषय"}</p>
                <p className="font-medium">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Description" : "विवरण"}</p>
                <p className="text-sm p-3 rounded-lg bg-muted">{selectedComplaint.description}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  {language === "en" ? "Admin Notes" : "एडमिन टिप्पणी"}
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={language === "en" ? "Add notes about this complaint..." : "यो गुनासोको बारेमा टिप्पणी थप्नुहोस्..."}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">{language === "en" ? "Update Status" : "स्थिति अपडेट"}</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "in_progress", "resolved"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={selectedComplaint.status === status ? "default" : "outline"}
                      size="sm"
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedComplaint.id, status)}
                      className={selectedComplaint.status === status ? "gradient-nepal" : ""}
                    >
                      {updating && selectedComplaint.status !== status ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {language === "en" ? statusConfig[status].label : statusConfig[status].labelNe}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
