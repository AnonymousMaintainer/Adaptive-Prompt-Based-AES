"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import CollapsibleExplanation from "@components/CollapsibleExplanation";
import CreateProjectModal from "@components/CreateProjectModal";
import ProjectOverview from "@components/ProjectOverview";
import { useRouter } from "next/navigation";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, RefreshCcw } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { createProject, fetchAllProjects } from "@/lib/ExamService";
import { ProjectCreate, ProjectRead } from "@app/types/project";
import { TaskRead } from "../types/task";
import { fetchTasks } from "@/lib/TaskCreationService";
import { checkAuthentication } from "@/lib/LoginService";

// Keep project page palette and routes

export default function ExamUploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const token = sessionStorage.getItem("token");
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      if (!checkAuthentication(token) || !token) return;
      const tasks = await fetchTasks(token);
      setTasks(tasks);
      const projects = await fetchAllProjects(token);
      setProjects(projects);
    };

    loadProjects();
  }, [token]);

  const handleSelectProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const handleRefreshProjects = async () => {
    const token = sessionStorage.getItem("token");
    if (!checkAuthentication(token) || !token) return;
    const projects = await fetchAllProjects(token);
    setProjects(projects);
    toast({
      title: "Success",
      description: "Projects refreshed successfully.",
      variant: "default",
    });
  };
  const handleCreateProject = (projectData: {
    project_name: string;
    course_name: string;
    section: string;
    task_id: number;
  }) => {
    const newProject: ProjectCreate = {
      project_name: projectData.project_name,
      course_name: projectData.course_name,
      section: projectData.section,
      task_id: projectData.task_id,
    };
    if (!checkAuthentication(token) || !token) return;
    try {
      createProject(token, newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Unable to create project.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: "Project created successfully.",
      variant: "default",
    });
    setIsModalOpen(false);
    // dummyProjects.push(newProject);
  };

  return (
    <>
      <Toaster />
      <SidebarInset>
        <Header page={"Projects"} href={"/projects"} />
        <div className="container mx-auto p-4 space-y-6">
          <CollapsibleExplanation />
          <div className="mb-4 flex justify-between items-center">
            <CardHeader>
              <CardTitle
                data-tour="projects-title"
                className="text-2xl font-bold flex items-center"
              >
                <FolderOpen className="mr-2 h-6 w-6" />
                Project Management
              </CardTitle>
              <CardDescription>
                View, Manage and Create Projects for your exams
              </CardDescription>
            </CardHeader>
            <div className="flex gap-2">
              <Button
                variant="default"
                data-tour="projects-create"
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                Create Project
              </Button>
              <Button
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground aspect-square mr-2"
                onClick={() => handleRefreshProjects()}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="px-4">
            {projects.length > 0 ? (
              <ProjectOverview
                projects={projects}
                onSelectProject={handleSelectProject}
                tasks={tasks}
              />
            ) : (
              <div className="text-left text-card-foreground">
                No projects available.
              </div>
            )}
            <CreateProjectModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreateProject={handleCreateProject}
              tasks={tasks}
            />
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
