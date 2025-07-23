export enum ExamStatus {
  Pending = "pending",
  Processing = "processing",
  Processed = "processed",
  Failed = "failed",
}

export interface ExamModel {
  status: ExamStatus;
  page: number;
  exam_image_url?: string;
  student_id?: string;
  student_section?: string;
  student_seat?: string;
  student_room?: string;
  exam_extracted_text?: string;
  exam_improved_text?: string;
  scoring_justification?: string;
  score_task_completion?: number;
  score_organization?: number;
  score_style_language_expression?: number;
  score_structural_variety_accuracy?: number;
  ai_comment?: string;
  user_id: number;
  project_id: number;
  id: number; 
  created_at: string;
  updated_at: string;
}

export interface ExamInDB extends ExamModel {
  id: number;
  created_at: string;
  updated_at: string;
}