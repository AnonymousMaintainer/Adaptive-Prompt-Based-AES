export interface ProjectCreate{
  project_name: string;
  course_name: string;
  section: string;
  task_id: number;
}


export interface ProjectRead extends ProjectCreate {
  id: number;
  created_at: string;
  user_id: number;
}

export interface ProjectUpdate {
  project_name?: string;
  course_name?: string;
  section?: string;
}