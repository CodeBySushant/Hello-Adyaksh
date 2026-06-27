"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import {
  MessageSquareWarning,
  Mail,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react"
import { safeFormatDate } from "@/lib/date"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"

interface Stats {
  complaints: {
    total: number
    pending: number
    in_progress: number
    resolved: number
  }
  messages: {
    total: number
    unread: number
  }
  development: {
    total: number
    ongoing: number
    completed: number
    total_budget: number
    total_spent: number
  }
}

interface Complaint {
  id: number
  tracking_id: string
  name: string
  subject: string
  status: string
  created_at: string
}

interface Message {
  id: number
  name: string
  subject: string
  status: string
  created_at: string
}

const weeklyData = [
  { day: "Mon", complaints: 4, messages: 6 },
  { day: "Tue", complaints: 3, messages: 4 },
  { day: "Wed", complaints: 5, messages: 8 },
  { day: "Thu", complaints: 2, messages: 5 },
  { day: "Fri", complaints: 6, messages: 3 },
  { day: "Sat", complaints: 1, messages: 2 },
  { day: "Sun", complaints: 3, messages: 4 },
]

export default function AdminDashboard() {
  const { language } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, complaintsRes, messagesRes] = await Promise.all([
        fetch("/api/statistics"),
        fetch("/api/complaints"),
        fetch("/api/contact"),
      ])

      const statsData = await statsRes.json()
      const complaintsData = await complaintsRes.json()
      const messagesData = await messagesRes.json()

      if (statsData.success) {
        setStats(statsData.data)
      }
      if (complaintsData.success) {
        setComplaints(complaintsData.data.slice(0, 5))
      }
      if (messagesData.success) {
        setMessages(messagesData.data.slice(0, 5))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
      </div>
    )
  }

  const statCards = [
    {
      label: language === "en" ? "Total Complaints" : "कुल गुनासो",
      value: stats?.complaints?.total || 0,
      icon: MessageSquareWarning,
      color: "from-[#DC143C] to-[#DC143C]/80",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: language === "en" ? "Pending" : "विचाराधीन",
      value: stats?.complaints?.pending || 0,
      icon: Clock,
      color: "from-yellow-500 to-yellow-400",
      trend: "-5%",
      trendUp: false,
    },
    {
      label: language === "en" ? "Resolved" : "समाधान भयो",
      value: stats?.complaints?.resolved || 0,
      icon: CheckCircle2,
      color: "from-green-500 to-green-400",
      trend: "+18%",
      trendUp: true,
    },
    {
      label: language === "en" ? "Messages" : "सन्देश",
      value: stats?.messages?.total || 0,
      icon: Mail,
      color: "from-[#003893] to-[#003893]/80",
      trend: "+8%",
      trendUp: true,
      badge: stats?.messages?.unread && stats.messages.unread > 0 ? stats.messages.unread : undefined,
    },
  ]

  const statusBarData = [
    { status: language === "en" ? "Pending" : "विचाराधीन", count: stats?.complaints?.pending || 0, fill: "#EAB308" },
    { status: language === "en" ? "In Progress" : "प्रक्रियामा", count: stats?.complaints?.in_progress || 0, fill: "#3B82F6" },
    { status: language === "en" ? "Resolved" : "समाधान", count: stats?.complaints?.resolved || 0, fill: "#22C55E" },
  ]

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gradient-nepal">
          {language === "en" ? "Dashboard" : "ड्यासबोर्ड"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === "en"
            ? "Overview of portal activities and submissions"
            : "पोर्टल गतिविधि र पेशहरूको अवलोकन"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} opacity-10 -translate-y-1/2 translate-x-1/2`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white relative`}>
                <stat.icon className="h-5 w-5" />
                {stat.badge && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#DC143C] text-white text-xs flex items-center justify-center font-medium">
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-xs ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
              {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{stat.trend} {language === "en" ? "from last week" : "गत हप्ताबाट"}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold mb-4">
            {language === "en" ? "Weekly Activity" : "साप्ताहिक गतिविधि"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC143C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003893" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#003893" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 56, 147, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#DC143C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComplaints)"
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#003893"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-[#DC143C]" />
              <span className="text-muted-foreground">{language === "en" ? "Complaints" : "गुनासो"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-[#003893]" />
              <span className="text-muted-foreground">{language === "en" ? "Messages" : "सन्देश"}</span>
            </div>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold mb-4">
            {language === "en" ? "Complaint Status" : "गुनासो स्थिति"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 56, 147, 0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">
              {language === "en" ? "Recent Complaints" : "हालका गुनासो"}
            </h3>
            <a href="/admin/complaints" className="text-sm text-[#003893] hover:underline">
              {language === "en" ? "View All" : "सबै हेर्नुहोस्"}
            </a>
          </div>
          <div className="divide-y">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {language === "en" ? "No complaints yet" : "अहिलेसम्म कुनै गुनासो छैन"}
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{complaint.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{complaint.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          complaint.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : complaint.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {complaint.status === "pending" && (language === "en" ? "Pending" : "विचाराधीन")}
                        {complaint.status === "in_progress" && (language === "en" ? "In Progress" : "प्रक्रियामा")}
                        {complaint.status === "resolved" && (language === "en" ? "Resolved" : "समाधान")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {safeFormatDate(new Date(complaint.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">
              {language === "en" ? "Recent Messages" : "हालका सन्देश"}
            </h3>
            <a href="/admin/messages" className="text-sm text-[#003893] hover:underline">
              {language === "en" ? "View All" : "सबै हेर्नुहोस्"}
            </a>
          </div>
          <div className="divide-y">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {language === "en" ? "No messages yet" : "अहिलेसम्म कुनै सन्देश छैन"}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{message.subject}</p>
                        {message.status === "unread" && (
                          <span className="h-2 w-2 rounded-full bg-[#DC143C]" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{message.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {safeFormatDate(new Date(message.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
