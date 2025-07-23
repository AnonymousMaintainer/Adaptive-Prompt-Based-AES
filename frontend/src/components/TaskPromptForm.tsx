"use client";

import type React from "react";

import { useState } from "react";
import FormField from "./FormField";
import type { TaskPromptFormProps, TaskPromptData } from "@app/types/task";
import { TASK_FORM_LABELS, TASK_FORM_HELPERS } from "@app/constants/task";

export default function TaskPromptForm({
  onSaveDraft,
  onSubmit,
  initialData,
}: TaskPromptFormProps) {
  const [formData, setFormData] = useState<TaskPromptData>({
    courseName: "",
    courseNumber: "",
    year: new Date().getFullYear().toString(),
    rubrics: "",
    exampleEvaluations: "",
    studentInstructions: "",
    ...initialData,
  });

  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() + i).toString(),
    label: (new Date().getFullYear() + i).toString(),
  }));

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDraftSaved(false);
  };

  const handleSaveDraft = () => {
    onSaveDraft(formData);
    setIsDraftSaved(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generatePreview = () => {
    return `Task Prompt for ${formData.courseName} (${formData.courseNumber}) - ${formData.year}

Rubrics:
${formData.rubrics}

Example Evaluations:
${formData.exampleEvaluations}

Student Instructions:
${formData.studentInstructions}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FormField
          label={TASK_FORM_LABELS.courseName}
          name="courseName"
          value={formData.courseName}
          onChange={handleChange}
          required
          tooltip={TASK_FORM_HELPERS.courseName}
        />

        <FormField
          label={TASK_FORM_LABELS.courseNumber}
          name="courseNumber"
          value={formData.courseNumber}
          onChange={handleChange}
          required
          helperText={TASK_FORM_HELPERS.courseNumber}
        />

        <FormField
          label={TASK_FORM_LABELS.year}
          name="year"
          value={formData.year.toString()}
          onChange={handleChange}
          type="select"
          required
          options={years}
        />

        <FormField
          label={TASK_FORM_LABELS.rubrics}
          name="rubrics"
          value={formData.rubrics}
          onChange={handleChange}
          type="textarea"
          required
          rows={6}
          helperText={TASK_FORM_HELPERS.rubrics}
        />

        <FormField
          label={TASK_FORM_LABELS.exampleEvaluations}
          name="exampleEvaluations"
          value={formData.exampleEvaluations}
          onChange={handleChange}
          type="textarea"
          required
          helperText={TASK_FORM_HELPERS.exampleEvaluations}
        />

        <FormField
          label={TASK_FORM_LABELS.studentInstructions}
          name="studentInstructions"
          value={formData.studentInstructions}
          onChange={handleChange}
          type="textarea"
          required
          helperText={TASK_FORM_HELPERS.studentInstructions}
        />
      </div>

      <div className="bg-[#EFFAFB] p-4 rounded-lg border border-[#A2E4F1]">
        <h3 className="text-sm font-medium text-[#040316] mb-2">
          AI Prompt Preview
        </h3>
        <pre className="text-sm text-[#040316] whitespace-pre-wrap">
          {generatePreview()}
        </pre>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2 text-[#040316] bg-[#A2E4F1] rounded-lg hover:bg-[#9EC6FF] transition-colors"
        >
          {isDraftSaved ? "Draft Saved" : "Save as Draft"}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-[#4792FA] rounded-lg hover:bg-[#9EC6FF] transition-colors"
        >
          Submit Task
        </button>
      </div>
    </form>
  );
}
