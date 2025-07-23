"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import Header from "@/components/Header";
import CollapsibleExplanation from "@components/CollapsibleExplanation";
import PDFUploader from "@components/PDFUploader";
import PagePreview from "@components/PagePreview";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchExamsByProject,
  fetchProjectById,
  uploadAndEvaluateExams,
} from "@/lib/ExamService";
import { fetchTasks } from "@/lib/TaskCreationService";
import { ExamInDB } from "@/app/types/exam";
import { TaskRead } from "@/app/types/task";
import { ProjectRead } from "@/app/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { checkAuthentication, verifyToken } from "@/lib/LoginService";
import { useIsMounted } from "@/hooks/useIsMounted";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function SubprojectPage() {
  const { slug } = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [project, setProject] = useState<ProjectRead>();
  const [selectedTask, setSelectedTask] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(
    null
  );
  const [pages, setPages] = useState<ExamInDB[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [evaluationFinished, setEvaluationFinished] = useState(false);
  const [showUploader, setShowUploader] = useState(true);

  const token = sessionStorage.getItem("token");

  // Add a function to remove a file from the files array
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!checkAuthentication(token) || !token) return;

    const loadData = async () => {
      const projectData = await fetchProjectById(
        token,
        parseInt(slug as string)
      );
      if (projectData) {
        setProject(projectData);
        console.log("Fetched project:", projectData);
      } else {
        console.error("Failed to fetch project:", parseInt(slug as string));
      }

      const examsData = await fetchExamsByProject(
        token,
        parseInt(slug as string)
      );
      if (examsData) {
        setPdfPreviewUrl(null); // Reset PDF preview URL
        setFiles([]); // Reset files
        setEvaluationFinished(true);
        setPages(examsData);
        console.log("Fetched exams:", examsData);
      } else {
        console.error(
          "Failed to fetch exams for project:",
          parseInt(slug as string)
        );
      }

      const tasksData = await fetchTasks(token);
      if (tasksData) {
        setTasks(tasksData);
        console.log("Fetched tasks:", tasksData);
      } else {
        console.error(
          "Failed to fetch tasks for project:",
          parseInt(slug as string)
        );
      }
    };

    loadData();
  }, [slug, token]);

  const handlePDFUpload = async (file: File) => {
    setFiles((prev) => {
      const updated = [...prev, file];
      setSelectedFileIndex(updated.length - 1);
      return updated;
    });
    const previewUrl = URL.createObjectURL(file);
    // Defer state update until after rendering is complete
    setTimeout(() => setPdfPreviewUrl(previewUrl), 0);
    const extractedPages = pages; // Replace with actual implementation
    console.log("Uploaded PDF pages:", extractedPages);
    setShowUploader(false); // Hide uploader after file is uploaded
  };

  const handleScoreUpdate = (
    pageId: number,
    category: string,
    score: number
  ) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, [category]: score } : page
      )
    );
  };

  const handleOcrTextUpdate = async (pageId: number, text: string) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, exam_extracted_text: text } : page
      )
    );
  };

  const evaluateAllPages = async () => {
    const token = sessionStorage.getItem("token");
    if (!checkAuthentication(token) || !token) return;
    const user = await verifyToken(token);
    if (!user) return;
    if (!selectedTask) {
      alert("Please select a task prompt first");
      return;
    }
    setIsEvaluating(true);
    setPdfPreviewUrl(null); // Reset PDF preview URL

    await uploadAndEvaluateExams(token, parseInt(slug as string), files);
    if (!isMounted.current) return;
    setIsEvaluating(false);
    setEvaluationFinished(true);
  };

  if (!project)
    return (
      <SidebarInset>
        <Header
          page={`Projects`}
          href={`/projects/`}
          slug={"0"}
          slug_page={"Loading..."}
        />
        <div className="container mx-auto p-4 space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </SidebarInset>
    );

  return (
    <>
      <SidebarInset>
        <Header
          page={`Projects`}
          href={`/projects/`}
          slug={project.id.toString()}
          slug_page={project.project_name}
        />
        <div className="container mx-auto p-4 space-y-6">
          <CollapsibleExplanation />
          <div className="mb-4">
            <Button
              variant="default"
              className="hover:bg-accent hover:text-accent-foreground"
              onClick={() => router.push("/projects")}
            >
              Return
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  {project.project_name}
                </h2>
                <p className="text-sm text-card-foreground opacity-75">
                  {project.course_name} - Section {project.section}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full p-2 border border-primary-foreground bg-card rounded-md focus:outline-none focus:ring-2 focus:ring-[#9EC6FF]"
                  >
                    <option value="">Select a task prompt</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.course_name} - {task.course_code} {task.year}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={evaluateAllPages}
                  disabled={isEvaluating || !selectedTask}
                  className="flex items-center gap-2 bg-accent text-accent-foreground font-bold px-4 py-2 rounded-lg hover:bg-green-500 hover:text-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayIcon className="h-5 w-5" />
                  {isEvaluating ? "Evaluating..." : "Evaluate All Pages"}
                </Button>
              </div>
            </div>
          </div>
          {showUploader && <PDFUploader onUpload={handlePDFUpload} />}
          <div className="space-x-2">
            {!showUploader && (evaluationFinished || files.length > 0) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowUploader(true)}
              >
                Add More Files
              </Button>
            )}
            {files.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    View Uploaded Files ({files.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-background">
                  <DialogHeader>
                    <DialogTitle>Uploaded Files</DialogTitle>
                    <DialogDescription className="text-sm italic text-muted-foreground">
                      Click on a file to preview it. Click &quot;Remove&quot; to
                      delete the file.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto">
                    <ul>
                      {files.map((file, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setSelectedFileIndex(index);
                            setPdfPreviewUrl(URL.createObjectURL(file));
                          }}
                          className={`flex items-center justify-between pl-2 py-1 border-b cursor-pointer rounded-lg ${
                            selectedFileIndex === index ? "bg-accent" : ""
                          }`}
                        >
                          <span className="truncate">{file.name}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                              if (selectedFileIndex === index) {
                                setPdfPreviewUrl(null);
                                setSelectedFileIndex(null);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {pdfPreviewUrl && (
            <Card className="pdf-preview mt-4">
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  PDF Preview
                </h2>
              </CardHeader>
              <CardContent>
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  className="w-full h-[1080px]"
                />
              </CardContent>
            </Card>
          )}
          {evaluationFinished && pages.length > 0 && (
            <PagePreview
              pages={[...pages].sort((a, b) => a.id - b.id)}
              taskPrompts={tasks}
              onScoreUpdate={handleScoreUpdate}
              onOcrTextUpdate={handleOcrTextUpdate}
            />
          )}
        </div>
      </SidebarInset>
    </>
  );
}
