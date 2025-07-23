import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { fetchProjectById } from "@/lib/ExamService"; // ...existing import paths...
import { TaskRead } from "@/app/types/task";
import { ProjectRead } from "@/app/types/project";
import { checkAuthentication } from "@/lib/LoginService";

interface EditProjectModalProps {
  isOpen: boolean;
  projectId: number;
  onClose: () => void;
  onUpdateProject: (projectData: Partial<ProjectRead>) => void;
  tasks: TaskRead[];
}

export default function EditProjectModal({
  isOpen,
  projectId,
  onClose,
  onUpdateProject,
  tasks,
}: EditProjectModalProps) {
  const [formData, setFormData] = useState<Partial<ProjectRead>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadExistingProject = async () => {
      if (isOpen && projectId) {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!checkAuthentication(token) || !token) return;
        // onClose(); // Close the modal if it's already open
        try {
          const project: ProjectRead = await fetchProjectById(token, projectId);
          if (project) {
            setFormData({
              project_name: project.project_name || "",
              course_name: project.course_name || "",
              section: project.section || "",
              task_id: project.task_id || 0,
              id: project.id || 0,
            });
          }
        } catch (error) {
          console.error("Failed to fetch project:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadExistingProject();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject(formData ?? {});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Edit Project</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-primary hover:text-background"
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="project_name"
                className="block text-sm font-medium text-primary mb-1"
              >
                Project Name
              </label>
              <input
                id="project_name"
                name="project_name"
                type="text"
                value={formData?.project_name}
                onChange={(e) =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
                className="w-full p-2 border bg-background text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                required
              />
            </div>
            <div>
              <label
                htmlFor="course_name"
                className="block text-sm font-medium text-primary mb-1"
              >
                Course ID
              </label>
              <input
                id="course_name"
                name="course_name"
                type="text"
                value={formData?.course_name}
                onChange={(e) =>
                  setFormData({ ...formData, course_name: e.target.value })
                }
                className="w-full p-2 border bg-background text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                required
              />
            </div>
            <div>
              <label
                htmlFor="section"
                className="block text-sm font-medium text-primary mb-1"
              >
                Section
              </label>
              <input
                id="section"
                name="section"
                type="text"
                value={formData?.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                className="w-full p-2 border bg-background text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                required
              />
            </div>
            <div>
              <label
                htmlFor="task_id"
                className="block text-sm font-medium text-primary mb-1"
              >
                Task
              </label>
              <select
                id="task_id"
                name="task_id"
                value={formData?.task_id}
                onChange={(e) =>
                  setFormData({ ...formData, task_id: Number(e.target.value) })
                }
                className="w-full p-2 border bg-background text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              >
                <option key={0} value="0" disabled>
                  Select Task
                </option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    Task {task.id} - {task.course_name} {task.course_code} Y
                    {task.year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="destructive"
                onClick={onClose}
                className="px-4 py-2 hover:bg-red-500 hover:text-red-50 rounded-md"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-green-500 hover:text-green-50"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
