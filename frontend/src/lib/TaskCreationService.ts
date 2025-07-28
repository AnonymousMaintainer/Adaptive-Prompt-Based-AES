import { TaskCreate, TaskRead, TaskUpdate} from "@/app/types/task";
import { toast } from "@/hooks/use-toast"; // Adjust the import path as needed
// Define the Task interface
export interface Task {
  id: number;
  course_name: string;
  course_number: string;
  year: number;
  rubrics: string;
  example_evaluation: string;
  evaluations_student_task_instructions: string;
  created_by: number;
  essay_prompt: string;

  is_active: boolean;
}

export interface CreateTaskModel {
  created_by: number;
  course_name: string;
  course_number: string;
  year: number;
  rubrics: string;
  example_evaluation: string;
  evaluations_student_task_instructions: string;
  essay_prompt: string;
  is_active: boolean;
}

export type CreateTask = Omit<Task, "id" | "created_at" | "is_active">;


// Fetch tasks from the backend using fetch instead of axios
export const fetchTasks = async (token: string): Promise<TaskRead[]> => {
  try {
    const response = await fetch(
      `${process.env.BASE_BACKEND_URL}/api/v1/tasks/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data: TaskRead[] = await response.json();
      return data;
    } else {
      console.error("Error fetching tasks:", response.statusText);
      toast({
        title: "Error",
        description: "Unable to fetch tasks.",
        variant: "destructive",
      });
      return [];
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast({
      title: "Error",
      description: "Unable to fetch tasks.",
      variant: "destructive",
    });
    return [];
  }
};

// Create a new task on the backend using fetch instead of axios
export const createTask = async (
  token: string,
  taskData: TaskCreate
): Promise<TaskRead | null> => {
  try {
    const response = await fetch(
      `${process.env.BASE_BACKEND_URL}/api/v1/tasks/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      }
    );

    if (response.status === 201) {
      const data: TaskRead = await response.json();
      return data;
    } else {
      console.error("Error creating task:", response.statusText);
      toast({
        title: "Error",
        description: "Unable to create task.",
        variant: "destructive",
      });
      return null;
    }
  } catch (error) {
    console.error("Error creating task:", error);
    toast({
      title: "Error",
      description: "Unable to create task.",
      variant: "destructive",
    });
    return null;
  }
};

// Replace the HTTP method back to PATCH in the updateTask function
export const updateTask = async (
  token: string,
  id: number,
  taskData: TaskUpdate
): Promise<TaskUpdate | null> => {
  try {
    const response = await fetch(
      `${process.env.BASE_BACKEND_URL}/api/v1/tasks/${id}`,
      {
        method: "PUT", // Changed from "PUT" back to "PATCH"
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      }
    );

    if (response.ok) {
      const updatedTask: TaskRead = await response.json();
      return updatedTask;
    } else {
      console.error("Error updating task:", response.statusText);
      toast({
        title: "Error",
        description: "Unable to update task.",
        variant: "destructive",
      });
      return null;
    }
  } catch (error) {
    console.error("Error updating task:", error);
    toast({
      title: "Error",
      description: "Unable to update task.",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteTask = async (
  token: string,
  id: number
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.BASE_BACKEND_URL}/api/v1/tasks/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      console.error("Error deleting task:", response.statusText);
      toast({
        title: "Error",
        description: "Unable to delete task.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    toast({
      title: "Error",
      description: "Unable to delete task.",
      variant: "destructive",
    });
    return false;
  }
};

export async function getTaskById(token: string, taskId: number): Promise<Task | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/tasks/${taskId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch task.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    return null;
  }
}
