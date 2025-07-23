export interface TaskCreate {
  course_name: string;
  course_code: string;
  year: string;
  rubrics: string;
  example_evaluation: string;
  student_instruction: string;
}


export interface TaskRead extends TaskCreate {
  id: number;
  created_at: string;
}

export interface TaskUpdate {
  course_name?: string;
  course_code?: string;
  year?: string;
  rubrics?: string;
  example_evaluation?: string;
  student_instruction?: string;
}

export interface TaskPromptData {
  courseName: string
  courseNumber: string
  year: string
  rubrics: string
  exampleEvaluations: string
  studentInstructions: string
}

export interface TaskPrompt extends TaskPromptData {
  id: string
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
}

export interface TaskPromptFormProps {
  onSaveDraft: (data: TaskPromptData) => void
  onSubmit: (data: TaskPromptData) => void
  initialData?: Partial<TaskPromptData>
}

