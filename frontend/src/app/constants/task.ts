export const TASK_FORM_LABELS = {
  courseName: "Course Name",
  courseNumber: "Course Number",
  year: "Year",
  rubrics: "Rubrics",
  exampleEvaluations: "Example Teacher Evaluations",
  studentInstructions: "Student Task Instructions",
}

export const TASK_FORM_HELPERS = {
  courseName: 'Enter the full name of the course (e.g., "Introduction to Computer Science")',
  courseNumber: 'Enter the course code (e.g., "CS101")',
  rubrics: "Define clear scoring criteria for each category (e.g., Content, Structure, Grammar, etc.)",
  exampleEvaluations: "Provide examples of teacher evaluations for different score ranges",
  studentInstructions: "Provide clear instructions for students about the task requirements",
}

export const TASK_STATUS = {
  draft: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800",
  },
  published: {
    label: "Published",
    color: "bg-green-100 text-green-800",
  },
} as const

