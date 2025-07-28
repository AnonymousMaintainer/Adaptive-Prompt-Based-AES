"use client";

import React, { useState, useEffect } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ProjectRead } from "@/app/types/project";
import EditProjectModal from "./EditProjectModal";
import { TaskRead } from "@/app/types/task";
import { ExamStatus } from "@/app/types/exam";
import {
  deleteProjectById,
  fetchExamsByProject,
  updateProjectById,
} from "@/lib/ExamService";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

interface ProjectOverviewProps {
  projects: ProjectRead[];
  onSelectProject: (projectId: number) => void;
  tasks: TaskRead[];
}

export default function ProjectOverview({
  projects,
  onSelectProject,
  tasks,
}: ProjectOverviewProps) {
  const [filters, setFilters] = useState({
    course: "",
    section: "",
  });
  const [groupBy, setGroupBy] = useState<"date" | "course">("date");
  const [showFilters, setShowFilters] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [examStatusFilter, setExamStatusFilter] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(
    null
  );

  const [matchingProjects, setMatchingProjects] = useState<Set<number>>(
    new Set()
  );

  const uniqueCourses = [...new Set(projects.map((p) => p.course_name))];
  const uniqueSections = [...new Set(projects.map((p) => p.section))];

  useEffect(() => {
    async function checkProjects() {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const matched = new Set<number>();
      if (examStatusFilter) {
        for (const project of projects) {
          const exams = await fetchExamsByProject(
            token,
            project.id,
            examStatusFilter
          );
          if (exams && exams.length > 0) {
            matched.add(project.id);
          }
        }
      } else {
        projects.forEach((p) => matched.add(p.id));
      }
      setMatchingProjects(matched);
    }
    checkProjects();
  }, [examStatusFilter, projects]);

  const filteredProjects = projects.filter((project) => {
    if (filters.course && project.course_name !== filters.course) return false;
    if (filters.section && project.section !== filters.section) return false;
    if (examStatusFilter && !matchingProjects.has(project.id)) return false;
    return true;
  });

  const groupedProjects = filteredProjects.reduce((acc, project) => {
    const key =
      groupBy === "date"
        ? project.created_at.split("T")[0]
        : project.course_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(project);
    return acc;
  }, {} as Record<string, ProjectRead[]>);

  const resetFilters = () => {
    setFilters({
      course: "",
      section: "",
    });
    setExamStatusFilter("");
  };

  const handleEditProject = async (projectId: number) => {
    setSelectedProjectId(projectId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (projectId: number) => {
    setDeletingProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProjectId) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setDeletingProjectId(null);
      return;
    }
    await deleteProjectById(token, deletingProjectId);
    toast({
      title: "Success",
      description: "Project deleted successfully.",
    });
    setDeleteDialogOpen(false);
    setDeletingProjectId(null);
    // Optionally: refresh projects list or update state.
  };

  const handleUpdateProject = async (projectData: Partial<ProjectRead>) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found.",
        variant: "destructive",
      });
      return;
    }
    if (!projectData.id) {
      toast({
        title: "Error",
        description: "Project ID not found.",
        variant: "destructive",
      });
      return;
    }
    await updateProjectById(token, projectData.id, projectData);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-start items-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </Button>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "date" | "course")}
              className="px-3 py-2 text-sm text-primary bg-transparent rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <option value="date">Group by Date</option>
              <option value="course">Group by Course</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="bg-card p-4 rounded-lg border border-card-foreground space-y-4 overflow-hidden"
              key="filters"
              initial={{
                opacity: 0,
                height: 0,
                scaleY: 0,
                transformOrigin: "top center",
              }}
              animate={{ opacity: 1, height: "auto", scaleY: 1 }}
              exit={{ opacity: 0, height: 0, scaleY: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-primary">Filter Projects</h3>
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="text-sm text-primary hover:text-secondary-foreground hover:bg-secondary transition-colors"
                >
                  Reset Filters
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select
                  value={filters.course}
                  onChange={(e) =>
                    setFilters({ ...filters, course: e.target.value })
                  }
                  className="p-2 border border-card-foreground bg-secondary text-secondary-foreground rounded-lg"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.section}
                  onChange={(e) =>
                    setFilters({ ...filters, section: e.target.value })
                  }
                  className="p-2 border border-card-foreground bg-secondary text-secondary-foreground rounded-lg"
                >
                  <option value="">All Sections</option>
                  {uniqueSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
                <select
                  value={examStatusFilter}
                  onChange={(e) => setExamStatusFilter(e.target.value)}
                  className="p-2 border border-card-foreground bg-secondary text-secondary-foreground rounded-lg"
                >
                  <option value="">All Exam Statuses</option>
                  <option value={ExamStatus.Pending}>Pending</option>
                  <option value={ExamStatus.Processing}>Processing</option>
                  <option value={ExamStatus.Processed}>Processed</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {Object.entries(groupedProjects).map(([group, projects]) => (
            <div key={group} className="space-y-4">
              <h3 className="text-lg font-medium text-primary">
                {groupBy === "date"
                  ? new Date(group).toLocaleDateString()
                  : group}
              </h3>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="bg-card rounded-lg shadow-md border p-4 hover:border-primary transition-colors cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-primary">
                          {project.project_name}
                        </h4>
                        <p className="text-sm text-primary opacity-75">
                          {project.course_name} - Section {project.section}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(project.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end items-center mt-2 space-x-2">
                      <p className="text-xs text-primary opacity-75">
                        Created at:{" "}
                        {new Date(project.created_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProjectId !== null && (
        <EditProjectModal
          isOpen={editModalOpen}
          projectId={selectedProjectId}
          onClose={() => setEditModalOpen(false)}
          onUpdateProject={handleUpdateProject}
          tasks={tasks}
        />
      )}
      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
