"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  IndianRupee,
  Building,
  Loader2,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import useSWR from "swr";

interface Report {
  id: number;
  title_en: string;
  title_np: string | null;
  description_en: string | null;
  description_np: string | null;
  report_type: string;
  fiscal_year: string;
  file_url: string;
  file_size: number;
  download_count: number;
  published_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const yearlyBudgetData = [
  { year: "2077-78", budget: 80000000, expenditure: 72000000 },
  { year: "2078-79", budget: 95000000, expenditure: 88000000 },
  { year: "2079-80", budget: 110000000, expenditure: 95000000 },
  { year: "2080-81", budget: 125000000, expenditure: 102000000 },
  { year: "2081-82", budget: 140000000, expenditure: 56000000 },
];

const sectorWiseData = [
  { name: "Infrastructure", nameNp: "पूर्वाधार", value: 35, fill: "#003893" },
  { name: "Education", nameNp: "शिक्षा", value: 25, fill: "#DC143C" },
  { name: "Health", nameNp: "स्वास्थ्य", value: 20, fill: "#10B981" },
  { name: "Social Welfare", nameNp: "समाज कल्याण", value: 12, fill: "#F59E0B" },
  { name: "Administration", nameNp: "प्रशासन", value: 8, fill: "#6B7280" },
];

const populationTrendData = [
  { year: "2076", population: 42000 },
  { year: "2077", population: 43200 },
  { year: "2078", population: 43800 },
  { year: "2079", population: 44500 },
  { year: "2080", population: 45100 },
  { year: "2081", population: 45672 },
];

const REPORT_TYPES = [
  { value: "all", labelEn: "All Types", labelNp: "सबै प्रकार" },
  { value: "budget", labelEn: "Budget", labelNp: "बजेट" },
  { value: "development", labelEn: "Development", labelNp: "विकास" },
  { value: "census", labelEn: "Census", labelNp: "जनगणना" },
  { value: "audit", labelEn: "Audit", labelNp: "लेखापरीक्षण" },
  { value: "annual", labelEn: "Annual", labelNp: "वार्षिक" },
  { value: "quarterly", labelEn: "Quarterly", labelNp: "त्रैमासिक" },
];

const FISCAL_YEARS = [
  { value: "all", labelEn: "All Years", labelNp: "सबै वर्ष" },
  "2081-82",
  "2080-81",
  "2079-80",
  "2078-79",
  "2077-78",
];

const formatFileSize = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ReportsPage() {
  const { language } = useLanguage();
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const params = new URLSearchParams();
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (yearFilter !== "all") params.set("year", yearFilter);
  const queryString = params.toString();

  const { data, isLoading } = useSWR<{ success: boolean; data: Report[] }>(
    `/api/reports${queryString ? `?${queryString}` : ""}`,
    fetcher,
  );

  const reports = data?.data || [];

  const handleDownload = async (report: Report) => {
    fetch(`/api/reports/${report.id}`, { method: "PATCH" }).catch(() => {});
    const link = document.createElement("a");
    link.href = report.file_url;
    link.download = report.title_en;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#003893]/[0.02]">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003893]/5 border border-[#003893]/10 mb-6">
              <BarChart3 className="h-4 w-4 text-[#DC143C]" />
              <span className="text-sm font-medium text-[#003893]">
                {language === "en" ? "Data Transparency" : "डाटा पारदर्शिता"}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#DC143C] to-[#003893] bg-clip-text text-transparent">
                {language === "en" ? "Reports & Data" : "प्रतिवेदन र डाटा"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Access ward reports, financial data, and development statistics for complete transparency"
                : "पूर्ण पारदर्शिताको लागि वडा प्रतिवेदन, वित्तीय डाटा, र विकास तथ्याङ्क पहुँच गर्नुहोस्"}
            </p>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {[
              {
                icon: IndianRupee,
                color: "#003893",
                bg: "bg-[#003893]/10",
                value: language === "ne" ? "१४ करोड" : "14 Cr",
                label: language === "en" ? "Annual Budget" : "वार्षिक बजेट",
              },
              {
                icon: TrendingUp,
                color: "#DC143C",
                bg: "bg-[#DC143C]/10",
                value: "85%",
                label: language === "en" ? "Budget Utilization" : "बजेट उपयोग",
              },
              {
                icon: Users,
                color: "#10B981",
                bg: "bg-green-100",
                value: language === "ne" ? "४५,६७२" : "45,672",
                label: language === "en" ? "Population" : "जनसंख्या",
              },
              {
                icon: Building,
                color: "#F59E0B",
                bg: "bg-amber-100",
                value: "12",
                label:
                  language === "en" ? "Active Projects" : "सक्रिय परियोजना",
              },
            ].map((stat, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="pt-6 text-center">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} mb-3`}
                  >
                    <stat.icon
                      className="h-6 w-6"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Budget Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#003893]/10">
                <CardHeader>
                  <CardTitle className="text-[#003893]">
                    {language === "en"
                      ? "Budget vs Expenditure Trend"
                      : "बजेट बनाम खर्च प्रवृत्ति"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 12, fill: "#003893" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#003893" }}
                          tickFormatter={(v) =>
                            `${(v / 10000000).toFixed(0)}Cr`
                          }
                        />
                        <Tooltip
                          formatter={(v: number) =>
                            `NPR ${(v / 10000000).toFixed(2)} Cr`
                          }
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="budget"
                          name={language === "ne" ? "बजेट" : "Budget"}
                          fill="#003893"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expenditure"
                          name={language === "ne" ? "खर्च" : "Expenditure"}
                          fill="#DC143C"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sector Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-[#003893]/10">
                <CardHeader>
                  <CardTitle className="text-[#003893]">
                    {language === "en"
                      ? "Budget by Sector"
                      : "क्षेत्र अनुसार बजेट"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorWiseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {sectorWiseData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => `${v}%`}
                          labelFormatter={(_, payload) => {
                            if (payload && payload[0]) {
                              const d = payload[0].payload;
                              return language === "ne" ? d.nameNp : d.name;
                            }
                            return "";
                          }}
                        />
                        <Legend
                          formatter={(_, entry) => {
                            const d =
                              entry.payload as (typeof sectorWiseData)[0];
                            return language === "ne" ? d.nameNp : d.name;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Population Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="border-[#003893]/10">
              <CardHeader>
                <CardTitle className="text-[#003893]">
                  {language === "en"
                    ? "Population Growth Trend"
                    : "जनसंख्या वृद्धि प्रवृत्ति"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={populationTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: "#003893" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#003893" }}
                        domain={["dataMin - 1000", "dataMax + 1000"]}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        formatter={(v: number) => v.toLocaleString()}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="population"
                        name={language === "ne" ? "जनसंख्या" : "Population"}
                        stroke="#003893"
                        strokeWidth={3}
                        dot={{ fill: "#DC143C", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8, fill: "#DC143C" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Downloadable Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[#003893]">
                {language === "en"
                  ? "Downloadable Reports"
                  : "डाउनलोड गर्न सकिने प्रतिवेदनहरू"}
              </h2>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {language === "ne" ? t.labelNp : t.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-32 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FISCAL_YEARS.map((y) =>
                      typeof y === "string" ? (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ) : (
                        <SelectItem key={y.value} value={y.value}>
                          {language === "ne" ? y.labelNp : y.labelEn}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === "en"
                  ? "No reports available"
                  : "कुनै प्रतिवेदन उपलब्ध छैन"}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.07 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-[#003893]/10 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#DC143C]/10 to-[#003893]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-[#003893]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#003893] text-sm mb-1 line-clamp-2">
                          {language === "ne" && report.title_np
                            ? report.title_np
                            : report.title_en}
                        </h3>
                        {(language === "ne"
                          ? report.description_np
                          : report.description_en) && (
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                            {language === "ne"
                              ? report.description_np
                              : report.description_en}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>{report.fiscal_year}</span>
                          {report.file_size > 0 && (
                            <span className="text-[#003893]">
                              {formatFileSize(report.file_size)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-full border-[#003893]/20 text-[#003893] hover:bg-[#003893]/5"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {language === "en" ? "Download PDF" : "PDF डाउनलोड"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
