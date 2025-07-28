/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExamInDB } from '@/app/types/exam';
import { ProjectCreate, ProjectRead } from '@/app/types/project';
import dotenv from 'dotenv';
dotenv.config();

export interface ExamData {
  teacher_id: number;
  task_id: number;
  student_name: string;
};

export async function uploadExam(token: string, examData: { [key: string]: any }, image: Blob | string): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/exams/upload`;
  const formData = new FormData();
  formData.append("exam_data", JSON.stringify(examData)); // Modified line
  formData.append("image", typeof image === 'string' ? new Blob([image], { type: 'image/jpeg' }) : image, "image.jpg"); // Modified line
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        // Removed "Content-Type" header to allow browser to set it automatically
      },
      body: formData,
    });
    return response;
  } 
  catch (error) {
    console.error("Error uploading exam:", error);
    return null;
  }
}

export async function uploadExamZip(token: string, examData: { [key: string]: any }, zipBytes: Blob): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/exams/upload/bulk`;
  const formData = new FormData();
  formData.append("exam_data", JSON.stringify(examData)); // Modified line
  formData.append("zipfile", typeof zipBytes === "string" ? new Blob([zipBytes], { type: 'application/x-zip-compressed' }) : zipBytes, "essays.zip"); // Updated line

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        // Removed "Content-Type" header to allow browser to set it automatically
      },
      body: formData,
    });
    
    return response;
  } catch (error) {
    console.error("Error uploading exam zip:", error);
    return null;
  }
}

export async function getExam(token: string, projectId: number, examId: number): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting exam:", error);
    return null;
  }
}


export async function fetchAllProjects(token: string): Promise<any> {
  // Ensure BASE_BACKEND_URL uses the proper protocol (http/https) that matches your server setup
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/`; 

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });


    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch projects.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

export async function createProject(token: string, project: ProjectCreate): Promise<any> {
  // Ensure BASE_BACKEND_URL uses the proper protocol (http/https) that matches your server setup
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/`; 

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project), // Example payload
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch projects.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}
export async function fetchProjectById(token: string, project_id: number): Promise<any> {
  // Ensure BASE_BACKEND_URL uses the proper protocol (http/https) that matches your server setup
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${project_id}`; 

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch projects.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

export async function updateProjectById(token: string, project_id: number, data: Partial<ProjectRead>): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${project_id}`; 

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch projects.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

export async function deleteProjectById(token: string, project_id: number): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${project_id}`; 

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error deleting exam:", error);
    return null;
  }
}

export async function updateExam(token: string, projectId: number ,  examId: number, examData: Partial<ExamInDB>): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examData),
    });

    return response;
  } catch (error) {
    console.error("Error updating exam:", error);
    return null;
  }
}



export async function deleteExam(token: string, projectId: number, examId: number): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error deleting exam:", error);
    return null;
  }
}

export async function uploadAndEvaluateExams(token: string, projectId: number, files: File[]): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/upload_and_evaluate`;
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to upload and evaluate exams.");
      return null;
    }
  } catch (error) {
    console.error("Error uploading and evaluating exams:", error);
    return null;
  }
}

export async function reEvaluateExam(token: string, projectId: number, examId: number): Promise<any> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}/evaluate`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to re-evaluate exam.");
      return null;
    }
  } catch (error) {
    console.error("Error re-evaluating exam:", error);
    return null;
  }
}

export async function fetchExamsByProject(
  token: string,
  projectId: number,
  status: string | null = null,
  skip: number = 0,
  limit: number = 10
): Promise<ExamInDB[] | null> {
  const url = new URL(`${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/`);

  // Add query parameters
  if (status) url.searchParams.append("status", status);
  url.searchParams.append("skip", skip.toString());
  url.searchParams.append("limit", limit.toString());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Removed "Content-Type" header to prevent preflight
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch exams by project.", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching exams by project:", error);
    return null;
  }
}

export async function fetchAllExams(token: string, projects: any): Promise<any[]> {
  if (!projects) {
    console.error("Failed to fetch projects.");
    return [];
  }

  const allExams: any[] = [];

  for (const project of projects) {
    const exams = await fetchExamsByProject(token, project.id);
    if (exams) {
      allExams.push(...exams);
    }
  }

  return allExams;
}

export async function downloadMultipleExamsPdf(token: string, projectId: number): Promise<Blob | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/download/pdf`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return await response.blob();
    } else {
      console.error("Failed to download exams PDF.", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error downloading exams PDF:", error);
    return null;
  }
}

export async function downloadMultipleExamsCsv(token: string, projectId: number): Promise<Blob | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/download/csv`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: '*/*',
        Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return await response.blob();
    } else {
      console.error("Failed to download exams CSV.", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error downloading exams CSV:", error);
    return null;
  }
}

export async function downloadExamPdf(token: string, projectId: number, examId: number): Promise<Blob | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}/download/pdf`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return await response.blob();
    } else {
      console.error("Failed to download exam PDF.", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error downloading exam PDF:", error);
    return null;
  }
}

export async function downloadExamCsv(token: string, projectId: number, examId: number): Promise<Blob | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/projects/${projectId}/exams/${examId}/download/csv`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return await response.blob();
    } else {
      console.error("Failed to download exam CSV.", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error downloading exam CSV:", error);
    return null;
  }
}
