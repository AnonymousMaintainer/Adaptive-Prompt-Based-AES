## 📄 **Exam Upload & Evaluation API Summary**

This API system allows teachers to upload a multi-page PDF containing student exams, automatically split the pages into images, and evaluate each page using an AI model. Each project represents one uploaded PDF and is made up of multiple exams — one per page.

---

### 🚀 **Workflow Overview**

1. **Upload and Evaluate (`POST /project/{project_id}/exams/upload_and_evaluate`)**
   - The teacher uploads a single PDF file containing multiple exam pages.
   - The PDF is split into individual pages.
   - Each page is uploaded to an S3 bucket and stored under a structured path:

     ```
     exams/user_{user_id}/project_{project_id}/exam_{exam_id}/page_{page_number}.jpg
     ```

     s3 bucket name: "culi-scoring"

   - Each page becomes an `Exam` record in the database with status `"pending"`.
   - A background task is immediately triggered to evaluate each page.

2. **Background Evaluation**
   - The `evaluate_project(project_id)` task loops through all pending exams in that project.
   - For each exam:
     - Marks it as `"processing"`
     - Calls an AI model (or placeholder for now) to evaluate the page
     - Saves the `score` and `feedback` in the database
     - Marks it as `"processed"`
   - If any errors occur, the exam is marked as `"failed"` and the error is stored.

3. **Exam Access & Management**
   - `GET /project/{project_id}/exams/`  
     Returns a list of all exams in the project with basic info (status, score, etc.).

   - `GET /project/{project_id}/exams/{exam_id}`  
     Returns full details for a single exam, including feedback and image URL.

   - `PUT /project/{project_id}/exams/{exam_id}`  
     Allows manual updates to an exam’s score, feedback, or status (e.g., for correction).

   - `PUT /project/{project_id}/exams/{exam_id}/evaluate`  
     Triggers re-evaluation of a specific exam page using the same background logic.

---

### 🧠 **Key Concepts**

- **Project**: A PDF uploaded by a teacher containing multiple pages.
- **Exam**: One exam page (one image), stored individually with score, feedback, and status.
- **Status Field**:
  - `"pending"`: Awaiting evaluation
  - `"processing"`: Being evaluated in the background
  - `"processed"`: Finished evaluation
  - `"failed"`: Evaluation failed (e.g., due to LLM error)

---

### 📦 **Architecture Highlights**

- **FastAPI** handles the APIs and background task orchestration.
- **S3** stores exam images with a structured path per user/project/exam.
- **SQLModel (or SQLAlchemy)** stores projects and exams with related metadata.
- **PDF → Image**
- **AI Evaluation** (LLM/OCR) is rate-limited and handled via background tasks using `BackgroundTasks`.
- **Evaluation is asynchronous**, so users can upload and go — results appear when ready.

---