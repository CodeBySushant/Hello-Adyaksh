"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// NOTE: This is static SAMPLE data, not fetched from the database. Wire these
// to a real endpoint (e.g. /api/statistics) when live ward data is available.
// Data
const genderData = [
  { name: "Male", value: 12500, fill: "#003893" },
  { name: "Female", value: 13200, fill: "#DC143C" },
  { name: "Other", value: 150, fill: "#6B7280" },
];

const ageDistributionData = [
  { age: "0-14", male: 2100, female: 2000 },
  { age: "15-24", male: 2800, female: 2900 },
  { age: "25-44", male: 3500, female: 3800 },
  { age: "45-64", male: 2500, female: 2700 },
  { age: "65+", male: 1600, female: 1800 },
];

const educationData = [
  { level: "Primary", count: 8500, percentage: 33 },
  { level: "Secondary", count: 7200, percentage: 28 },
  { level: "Higher Sec.", count: 5400, percentage: 21 },
  { level: "Bachelor+", count: 3200, percentage: 12 },
  { level: "Illiterate", count: 1550, percentage: 6 },
];

const budgetData = [
  { name: "Infrastructure", allocated: 4500000, spent: 3200000 },
  { name: "Education", allocated: 2000000, spent: 1800000 },
  { name: "Health", allocated: 1500000, spent: 1200000 },
  { name: "Social", allocated: 1000000, spent: 800000 },
];

const monthlyProgressData = [
  { month: "Jan", completed: 2, ongoing: 5 },
  { month: "Feb", completed: 3, ongoing: 4 },
  { month: "Mar", completed: 5, ongoing: 6 },
  { month: "Apr", completed: 4, ongoing: 5 },
  { month: "May", completed: 6, ongoing: 4 },
  { month: "Jun", completed: 7, ongoing: 3 },
];

const COLORS = ["#003893", "#DC143C", "#6B7280", "#10B981", "#F59E0B"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-[#003893]/10">
        <p className="font-semibold text-[#003893] mb-1">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}:{" "}
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface StatisticsChartsProps {
  language: string;
  isInView: boolean;
}

export function StatisticsCharts({ language, isInView }: StatisticsChartsProps) {
  return (
    <>
        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Gender Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10"
          >
            <h3 className="text-lg font-semibold text-[#003893] mb-2">
              {language === "en" ? "Gender Distribution" : "लिङ्ग वितरण"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? "Population by gender breakdown"
                : "लिङ्ग अनुसार जनसंख्या विभाजन"}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#003893", strokeWidth: 1 }}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-[#003893]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Age Distribution Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10"
          >
            <h3 className="text-lg font-semibold text-[#003893] mb-2">
              {language === "en" ? "Age Distribution" : "उमेर वितरण"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? "Population by age groups"
                : "उमेर समूह अनुसार जनसंख्या"}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 12, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-sm text-[#003893]">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="male"
                    name="Male"
                    fill="#003893"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="female"
                    name="Female"
                    fill="#DC143C"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Education Level Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10"
          >
            <h3 className="text-lg font-semibold text-[#003893] mb-2">
              {language === "en" ? "Education Distribution" : "शिक्षा वितरण"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? "Population by education level"
                : "शिक्षा स्तर अनुसार जनसंख्या"}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={educationData} layout="vertical" barSize={20}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="level"
                    tick={{ fontSize: 11, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Population" radius={[0, 4, 4, 0]}>
                    {educationData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Budget vs Expenditure */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10"
          >
            <h3 className="text-lg font-semibold text-[#003893] mb-2">
              {language === "en" ? "Budget vs Expenditure" : "बजेट बनाम खर्च"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "en"
                ? "Financial transparency (NPR in millions)"
                : "वित्तीय पारदर्शिता (लाखमा)"}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#003893" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `NPR ${value.toLocaleString()}`
                    }
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 56, 147, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-sm text-[#003893]">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="allocated"
                    name="Allocated"
                    fill="#003893"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="#DC143C"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Development Progress Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#003893]/10"
        >
          <h3 className="text-lg font-semibold text-[#003893] mb-2">
            {language === "en"
              ? "Development Progress Trend"
              : "विकास प्रगति प्रवृत्ति"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "en"
              ? "Monthly project completion and ongoing works"
              : "मासिक परियोजना सम्पन्न र चालू कार्यहरू"}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProgressData}>
                <defs>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#003893" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#003893" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOngoing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC143C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#003893" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#003893" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-[#003893]">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#003893"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="ongoing"
                  name="Ongoing"
                  stroke="#DC143C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOngoing)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
    </>
  );
}
