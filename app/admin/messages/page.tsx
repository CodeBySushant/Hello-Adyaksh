"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MailOpen,
  Phone,
  Calendar,
  MessageSquare,
  CheckCheck,
  Loader2,
  Send,
  Trash2,
  MoreVertical,
  MailCheck,
  MailX,
  RefreshCw,
  XCircle,
  Inbox,
} from "lucide-react";
import { safeFormatDate } from "@/lib/date";
import useSWR from "swr";
import { toast } from "sonner";

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "unread" | "read" | "responded";
  response_message: string | null;
  responded_at: string | null;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  unread: { label: "New", className: "bg-[#DC143C] text-white" },
  read: { label: "Read", className: "bg-gray-100 text-gray-600" },
  responded: { label: "Responded", className: "bg-green-100 text-green-700" },
};

export default function AdminMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "responded">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, mutate } = useSWR<{ success: boolean; data: Message[] }>(
    "/api/contact",
    fetcher,
    { refreshInterval: 30000 }
  );

  const messages = data?.data || [];

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const respondedCount = messages.filter((m) => m.status === "responded").length;
  const readCount = messages.filter((m) => m.status === "read").length;

  const openMessage = async (message: Message) => {
    setSelectedMessage(message);
    setResponseText(message.response_message ?? "");

    if (message.status === "unread") {
      try {
        await fetch("/api/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: message.id, status: "read" }),
        });
        mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  data: prev.data.map((m) =>
                    m.id === message.id ? { ...m, status: "read" } : m
                  ),
                }
              : prev,
          false
        );
        setSelectedMessage({ ...message, status: "read" });
      } catch {
        // silent
      }
    }
  };

  const markStatus = async (message: Message, status: Message["status"]) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      mutate();
      if (selectedMessage?.id === message.id) setSelectedMessage(json.data);
      toast.success(`Marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const sendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;
    setResponding(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMessage.id,
          status: "responded",
          response_message: responseText,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSelectedMessage(json.data);
      mutate();
      toast.success("Response saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save response");
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMessage) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact?id=${deletingMessage.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Message deleted.");
      if (selectedMessage?.id === deletingMessage.id) setSelectedMessage(null);
      setDeletingMessage(null);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">Contact Messages</h1>
          <p className="text-muted-foreground text-sm">View and respond to citizen inquiries</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2 rounded-full">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: "all",       label: "Total",     value: messages.length, color: "text-[#003893]", bg: "bg-[#003893]/5",  ring: "ring-[#003893]" },
          { key: "unread",    label: "Unread",    value: unreadCount,     color: "text-[#DC143C]", bg: "bg-[#DC143C]/5",  ring: "ring-[#DC143C]" },
          { key: "read",      label: "Read",      value: readCount,       color: "text-gray-600",  bg: "bg-gray-50",      ring: "ring-gray-400" },
          { key: "responded", label: "Responded", value: respondedCount,  color: "text-green-600", bg: "bg-green-50",     ring: "ring-green-500" },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key as typeof filter)}
            className={`p-4 rounded-xl text-left transition-all border ${stat.bg} ${
              filter === stat.key
                ? `ring-2 ${stat.ring}`
                : "border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.key === "unread" && unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#DC143C] animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Messages list */}
      {filteredMessages.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-border shadow-sm">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || filter !== "all" ? "No messages match your filters" : "No messages yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                  message.status === "unread"
                    ? "border-l-4 border-l-[#DC143C] border-r-border border-t-border border-b-border"
                    : "border-border hover:border-[#003893]/20"
                }`}
              >
                {/* Avatar */}
                <button onClick={() => openMessage(message)} className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    message.status === "unread"
                      ? "bg-gradient-to-br from-[#DC143C] to-[#003893] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {message.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Content */}
                <button onClick={() => openMessage(message)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${message.status === "unread" ? "font-semibold" : "font-medium"}`}>
                        {message.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-xs ${STATUS_STYLES[message.status]?.className}`}>
                        {STATUS_STYLES[message.status]?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {safeFormatDate(new Date(message.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 truncate ${
                    message.status === "unread" ? "font-medium text-[#003893]" : "text-foreground"
                  }`}>
                    {message.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {message.message}
                  </p>
                </button>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => openMessage(message)}>
                      <MailOpen className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {message.status !== "read" && (
                      <DropdownMenuItem onClick={() => markStatus(message, "read")}>
                        <MailCheck className="h-4 w-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    {message.status !== "unread" && (
                      <DropdownMenuItem onClick={() => markStatus(message, "unread")}>
                        <MailX className="h-4 w-4 mr-2" />
                        Mark as Unread
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingMessage(message)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#003893]">
              <MessageSquare className="h-5 w-5 text-[#DC143C]" />
              Message Details
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* Sender info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#003893]/5 border border-[#003893]/10">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#DC143C] to-[#003893] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedMessage.email}</p>
                </div>
                <Badge className={`${STATUS_STYLES[selectedMessage.status]?.className} flex-shrink-0`}>
                  {STATUS_STYLES[selectedMessage.status]?.label}
                </Badge>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="text-sm font-medium">{selectedMessage.phone || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> Received
                  </p>
                  <p className="text-sm font-medium">
                    {safeFormatDate(new Date(selectedMessage.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="font-semibold text-[#003893]">{selectedMessage.subject}</p>
              </div>

              {/* Message body */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="p-4 rounded-xl bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Existing response */}
              {selectedMessage.status === "responded" && selectedMessage.response_message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CheckCheck className="h-3 w-3 text-green-600" />
                    Response sent{" "}
                    {selectedMessage.responded_at
                      ? `on ${safeFormatDate(new Date(selectedMessage.responded_at), "MMM d, yyyy")}`
                      : ""}
                  </p>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm leading-relaxed">
                    {selectedMessage.response_message}
                  </div>
                </div>
              )}

              {/* Response textarea */}
              <div className="pt-2 border-t border-border space-y-2">
                <Label className="text-sm font-medium">
                  {selectedMessage.status === "responded" ? "Update Response" : "Write a Response"}
                </Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response to this message..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={sendResponse}
                    disabled={responding || !responseText.trim()}
                    className="flex-1 bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full"
                  >
                    {responding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {responding
                      ? "Saving..."
                      : selectedMessage.status === "responded"
                      ? "Update Response"
                      : "Send Response"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full text-red-500 hover:text-red-600 hover:border-red-200"
                    onClick={() => {
                      setDeletingMessage(selectedMessage);
                      setSelectedMessage(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingMessage}
        onOpenChange={(open) => !isDeleting && !open && setDeletingMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              Message from <strong>{deletingMessage?.name}</strong> about{" "}
              <strong>"{deletingMessage?.subject}"</strong> will be permanently deleted.
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
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}