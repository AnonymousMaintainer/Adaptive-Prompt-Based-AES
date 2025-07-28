export interface ExamStatsResponse {
    total_exams: number;
    pending_exams: number;
    completed_exams: number;
    score_distribution: Array<{ score: number; count: number }>;
}

// Fetch exam stats for the dashboard from /api/v1/stats/project/all
export async function fetchExamStats(token: string): Promise<ExamStatsResponse | null> {
  // Ensure BASE_BACKEND_URL uses the proper protocol (http/https) that matches your server setup
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/stats/project/all`; 

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
      console.error("Failed to fetch Stats.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Stats:", error);
    return null;
  }
}