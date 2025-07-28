"use client";
import React, { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import StatsCard from "../components/StatsCard";
import ScoreDistributionChart from "../components/ScoreDistributionChart";
import { BellIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementBase } from "./types/dashboard";
import { ExamStatsResponse, fetchExamStats } from "@/lib/DashboardService";
import { checkAuthentication } from "@/lib/LoginService";

export default function Home() {
  const { toast } = useToast(); // Initialize toast
  const [loading, setLoading] = useState(true); // new loading state
  const [stats, setStats] = useState<ExamStatsResponse>({
    total_exams: 0,
    pending_exams: 0,
    completed_exams: 0,
    score_distribution: [],
  });
  const [announcements, setAnnouncements] = useState<AnnouncementBase[]>([]);
  const [teacherName, setTeacherName] = useState<string>("");
  useEffect(() => {
    const loadDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!checkAuthentication(token) || !token) return; // Check authentication

      try {
        const username = sessionStorage.getItem("username") || "User";

        const fetchedStats = await fetchExamStats(token);
        if (!fetchedStats) {
          toast({
            title: "Error",
            description: "Failed to load exam stats.",
            variant: "destructive",
          });
          setStats({
            total_exams: 0,
            pending_exams: 0,
            completed_exams: 0,
            score_distribution: [],
          });
          return;
        }
        setStats(fetchedStats as ExamStatsResponse);

        setTeacherName(username);

        // Dummy announcements
        setAnnouncements([
          {
            id: 1,
            title: "System Maintenance",
            content: "Scheduled maintenance on Saturday, 10:00 PM - 11:00 PM",
            date: "2025-04-12",
          },
          {
            id: 2,
            title: "New Feature Release",
            content: "Bulk upload functionality now available",
            date: "2025-04-08",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <SidebarInset>
        <Header page="Dashboard" />

        <div className="container mx-auto p-4">
          <CardHeader>
            <CardTitle
              data-tour="dashboard-title"
              className="text-4xl text-primary font-bold flex items-center "
            >
              Welcome back, {teacherName}!
            </CardTitle>
            <CardDescription className="text-lg text-secondary-foreground">
              <Sparkles className="inline mr-1" />
              Here&#39;s an overview of your current tasks and statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Dashboard Components */}
            <div className="space-y-4 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                <ScoreDistributionChart
                  scoreDistribution={stats.score_distribution}
                />

                {/* Stats Cards */}
                <div className="flex flex-col gap-6">
                  <StatsCard
                    title="Total Exams"
                    value={stats.total_exams}
                    link="projects"
                  />
                  <StatsCard
                    title="Exams Pending"
                    value={stats.pending_exams}
                    link="projects"
                    filter="pending"
                  />
                  <StatsCard
                    title="Exams Completed"
                    value={stats.completed_exams}
                    link="projects"
                    filter="processed"
                  />
                </div>
              </div>

              {/* Announcements and Contact Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements */}
                <div className="p-6 bg-card rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <BellIcon className="h-5 w-5 text-card-foreground" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Announcements
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="border-b pb-4 last:border-0"
                        >
                          <h4 className="font-medium text-card-foreground">
                            {announcement.title}
                          </h4>
                          <p className="text-sm text-card-foreground mt-1">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-card-foreground opacity-75 mt-2">
                            {announcement.date}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-left text-card-foreground">
                        No announcements available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Developer Contact */}
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <EnvelopeIcon className="h-5 w-5 text-card-foreground" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Developer Contact
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-card-foreground">
                      <span className="font-medium">Email:</span>{" "}
                      cogniticcore@gmail.com
                    </p>
                    {/* <p className="text-card-foreground">
                      <span className="font-medium">Phone:</span> +1 (555)
                      123-4567
                    </p>
                    <p className="text-card-foreground">
                      <span className="font-medium">Office Hours:</span>{" "}
                      Mon-Fri, 9:00 AM - 5:00 PM
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </SidebarInset>
    </>
  );
}
