"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useSWR, { mutate } from "swr";
import {
  Hammer,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";

interface DevelopmentWork {
  id: number;
  title_en: string;
  title_np: string | null;
  description_en: string | null;
  category: string | null;
  budget: number;
  spent: number;
  progress: number;
  status: string;
  start_date: string | null;
  expected_completion: string | null;
  location: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, string> = {
  planned: "bg-gray-500",
  ongoing: "bg-amber-500",
  completed: "bg-green-500",
  delayed: "bg-red-500",
};

export default function AdminWorksPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useSWR<{
    success: boolean;
    data: DevelopmentWork[];
  }>("/api/development", fetcher);

  const works = data?.data || [];

  const filteredWorks = works.filter((work) =>
    work.title_en.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} L`;
    return amount.toLocaleString();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;

    await fetch(`/api/development?id=${id}`, {
      method: "DELETE",
    });

    // refresh data
    mutate("/api/development");
  };

  const handleEdit = async (work: any) => {
    const title = prompt("Title", work.title_en);
    const description = prompt("Description", work.description_en || "");
    const category = prompt("Category", work.category || "");
    const budget = prompt("Budget", work.budget.toString());
    const status = prompt("Status (planned/ongoing/completed)", work.status);

    await fetch("/api/development", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: work.id,
        title_en: title,
        description_en: description,
        category,
        budget: Number(budget),
        status,
      }),
    });

    mutate("/api/development");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003893]">
            Development Works
          </h1>
          <p className="text-muted-foreground">
            Track and manage ward development projects
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#DC143C] to-[#003893] text-white rounded-full"
          onClick={async () => {
            const title = prompt("Title");
            const description = prompt("Description");
            const category = prompt("Category");
            const budget = prompt("Budget");
            const status = prompt("Status (planned/ongoing/completed)");

            if (!title) return;

            await fetch("/api/development", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title_en: title,
                description_en: description,
                category,
                budget: Number(budget),
                status,
              }),
            });

            mutate("/api/development");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
        </div>
      ) : filteredWorks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Hammer className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`${statusColors[work.status] || "bg-gray-500"} text-white capitalize`}
                        >
                          {work.status}
                        </Badge>
                        {work.category && (
                          <Badge variant="outline" className="capitalize">
                            {work.category}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#003893] mb-1">
                        {work.title_en}
                      </h3>
                      {work.description_en && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {work.description_en}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {work.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {work.location}
                          </span>
                        )}
                        {work.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(work.start_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          Budget: NPR {formatBudget(work.budget)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium text-[#003893]">
                            {work.progress}%
                          </span>
                        </div>
                        <Progress value={work.progress} className="h-2" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(work)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(work.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
