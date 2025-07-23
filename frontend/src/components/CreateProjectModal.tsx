"use client";

import type React from "react";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { TaskRead } from "@/app/types/task";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: {
    project_name: string;
    course_name: string;
    section: string;
    task_id: number;
  }) => void;
  tasks: TaskRead[];
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  tasks,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    project_name: "",
    course_name: "",
    section: "",
    task_id: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    setFormData({ project_name: "", course_name: "", section: "", task_id: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">
            Create New Project
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-primary hover:text-background"
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.project_name}
              onChange={(e) =>
                setFormData({ ...formData, project_name: e.target.value })
              }
              className="w-full p-2 border bg-background text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Course ID
            </label>
            <input
              type="text"
              value={formData.course_name}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              className="w-full p-2 border bg-background  text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Section
            </label>
            <input
              type="text"
              value={formData.section}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              className="w-full p-2 border bg-background  text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Task
            </label>
            <select
              value={formData.task_id}
              onChange={(e) =>
                setFormData({ ...formData, task_id: Number(e.target.value) })
              }
              className="w-full p-2 border bg-background  text-foreground border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
            >
              <option value="0" disabled>
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
              className="px-4 py-2  hover:bg-red-500 hover:text-red-50 rounded-md"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-green-500 hover:text-green-50"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
