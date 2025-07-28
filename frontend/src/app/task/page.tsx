"use client";
import { SidebarInset } from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, Plus, Ban, ListChecks, Info } from "lucide-react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/TaskCreationService"; // Adjust the import path as needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { TASK_FORM_HELPERS } from "@/app/constants/task"; // Added import for helper texts
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"; // Import Tooltip components
import { TaskCreate, TaskRead, TaskUpdate } from "@app/types/task";
import { checkAuthentication } from "@/lib/LoginService";
import { Separator } from "@radix-ui/react-separator";

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskRead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tabState, setTabState] = useState("list");
  const { toast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskRead | null>(null);
  const token = sessionStorage.getItem("token");
  //#region TOKEN
  useEffect(() => {
    if (!checkAuthentication(token) || !token) return;
    const loadTasks = async () => {
      const fetchedTasks = await fetchTasks(token);
      setTasks(fetchedTasks);
    };
    loadTasks();
  }, [token]); // added 'token' to dependency array

  if (!token) {
    return null; // render nothing (or a fallback) after hooks have run
  }

  //#endregion TOKEN

  //#region TASK HANDLERS
  const handleSaveTask = async (task: Omit<TaskCreate, "id">) => {
    const newTask = await createTask(token, task);
    if (newTask) {
      setTasks([...tasks, newTask]);
      toast({
        title: "Task saved",
        description: "The task has been saved successfully.",
      });
    }
  };

  const handleUpdateTask = async (
    id: number,
    task: Partial<Omit<TaskUpdate, "id">>
  ) => {
    const updatedTask = await updateTask(token, id, task);
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === id ? { ...t, ...task } : t))
      );
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    const success = await deleteTask(token, id);
    if (success) {
      setTasks(tasks.filter((t) => t.id !== id));
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    }
  };

  //#endregion TASK HANDLERS
  return (
    <div className="flex h-screen w-screen">
      <Toaster />
      <SidebarInset>
        <Header page="Task" href="/task" />
        <div className="container mx-auto p-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <ListChecks className="mr-2 h-6 w-6" />
              Task Management
            </CardTitle>
            <CardDescription>
              View, Manage and Create tasks for evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tabState}>
              <TabsList>
                <TabsTrigger
                  data-tour="task-list-tab"
                  value="list"
                  onClick={() => setTabState("list")}
                >
                  Task List
                </TabsTrigger>
                <TabsTrigger
                  data-tour="task-create-tab"
                  value="create"
                  onClick={() => setTabState("create")}
                >
                  Create/Edit Task
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <Card>
                  <CardHeader>
                    <CardTitle>Task List</CardTitle>
                    <CardDescription>
                      Select a task to view or edit its details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      onValueChange={(value) =>
                        setSelectedTask(
                          tasks.find((t) => t.id.toString() === value) ?? null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id.toString()}>
                            {task.course_name} - {task.course_code} -{" "}
                            {task.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Separator className="py-2" />
                    {selectedTask && (
                      <div className="mt-4">
                        <div className="flex justify-between mb-4">
                          <h2 className="text-2xl font-semibold mb-2">
                            Task Details
                          </h2>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setIsEditing(true);
                                setTabState("create");
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Task
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setTaskToDelete(selectedTask);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Delete Task
                            </Button>
                          </div>
                        </div>
                        {Object.entries(selectedTask).map(([key, value]) => (
                          <div key={key} className="flex flex-col mb-1">
                            <label>
                              <strong>
                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                              </strong>
                            </label>
                            <div className="border border-background-foreground px-2 py-2 bg-background rounded-lg">
                              <Markdown remarkPlugins={[remarkBreaks]}>
                                {value.toString()}
                              </Markdown>
                            </div>
                          </div>
                        ))}

                        {/* Confirmation Dialog */}
                        <Dialog
                          open={isDeleteOpen}
                          onOpenChange={setIsDeleteOpen}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this task? This
                                action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (taskToDelete) {
                                    handleDeleteTask(taskToDelete.id);
                                  }
                                  setIsDeleteOpen(false);
                                }}
                              >
                                Confirm
                              </Button>
                              <Button
                                onClick={() => setIsDeleteOpen(false)}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <TaskForm
                  initialData={
                    isEditing && selectedTask ? selectedTask : undefined
                  }
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onSave={
                    isEditing
                      ? (task: TaskCreate) =>
                          selectedTask &&
                          handleUpdateTask(selectedTask.id, task)
                      : (task: TaskCreate) => handleSaveTask(task)
                  }
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </SidebarInset>
    </div>
  );
};

export default TaskManagementPage;

function TaskForm({
  initialData,
  onSave,
  isEditing,
  setIsEditing,
}: {
  initialData?: TaskRead;
  onSave: (task: TaskCreate) => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [taskData, setTaskData] = useState(
    initialData || {
      course_name: "",
      course_code: "",
      year: new Date().getFullYear().toString(),
      rubrics: "",
      example_evaluation: "",
      student_instruction: "",
      id: 0,
      created_at: new Date().toISOString(),
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(taskData);
  };

  // New: function to generate AI Prompt Preview
  const generatePreview = () => {
    return `Task Prompt for ${taskData.course_name} (${taskData.course_code}) - ${taskData.year}

Rubrics:
${taskData.rubrics}

Example Evaluations:
${taskData.example_evaluation}

Student Instructions:
${taskData.student_instruction}`;
  };

  // New: define the available years from current year to current year + 10
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <Card data-tour="task-form">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Task" : "Create New Task"}</CardTitle>
        <CardDescription>
          Fill in the details below to create or update a task.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="course_name"
              className="text-sm font-medium text-card-foreground flex items-center"
            >
              Course Name
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>{TASK_FORM_HELPERS.courseName}</TooltipContent>
              </Tooltip>
            </label>
            <Input
              id="course_name"
              name="course_name"
              value={taskData.course_name}
              onChange={handleChange}
              placeholder="Enter course name..."
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="course_number"
              className="text-sm font-medium text-card-foreground flex items-center"
            >
              Course Number
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  {TASK_FORM_HELPERS.courseNumber}
                </TooltipContent>
              </Tooltip>
            </label>
            <Input
              id="course_number"
              name="course_number"
              value={taskData.course_code}
              onChange={handleChange}
              placeholder="Enter course number..."
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="year"
              className="text-sm font-medium text-card-foreground"
            >
              Year
            </label>
            <Select
              value={taskData.year.toString()}
              onValueChange={(value) =>
                setTaskData({ ...taskData, year: String(value) })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="example_evaluation"
              className="text-sm font-medium text-card-foreground flex items-center"
            >
              Example Evaluation
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  {TASK_FORM_HELPERS.exampleEvaluations}
                </TooltipContent>
              </Tooltip>
            </label>
            <Textarea
              id="exampleEvaluation"
              name="example_evaluation"
              value={taskData.example_evaluation}
              onChange={handleChange}
              placeholder="Provide an example evaluation..."
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="rubrics"
              className="text-sm font-medium text-card-foreground flex items-center"
            >
              Rubrics
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>{TASK_FORM_HELPERS.rubrics}</TooltipContent>
              </Tooltip>
            </label>
            <Textarea
              id="rubrics"
              name="rubrics"
              value={taskData.rubrics}
              onChange={handleChange}
              placeholder="Specify rubrics for evaluation..."
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="evaluations_student_task_instructions"
              className="text-sm font-medium text-card-foreground flex items-center"
            >
              Evaluations Student Task Instructions
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  {TASK_FORM_HELPERS.studentInstructions}
                </TooltipContent>
              </Tooltip>
            </label>
            <Textarea
              id="evaluations_student_task_instructions"
              name="evaluations_student_task_instructions"
              value={taskData.student_instruction}
              onChange={handleChange}
              placeholder="Enter student task instructions..."
              className="mt-1"
            />
          </div>
          <div className="flex">
            <Button className="" variant="ghost">
              {initialData ? (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update Task
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create Task
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              type="reset"
              className="ml-2"
              onClick={() => {
                setTaskData({
                  example_evaluation: "",
                  rubrics: "",
                  course_name: "",
                  course_code: "",
                  year: new Date().getFullYear().toString(),
                  student_instruction: "",
                  id: 0,
                  created_at: new Date().toISOString(),
                });
                if (isEditing) {
                  setIsEditing(false);
                }
              }}
            >
              <>
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </>
            </Button>
          </div>
          {/* New: Insert Task Prompt Preview */}
          <div className="bg-[#EFFAFB] p-4 rounded-lg border border-[#A2E4F1] mt-4">
            <h3 className="text-sm font-medium text-[#040316] mb-2">
              AI Prompt Preview
            </h3>
            <pre className="text-sm text-[#040316] whitespace-pre-wrap">
              {generatePreview()}
            </pre>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
