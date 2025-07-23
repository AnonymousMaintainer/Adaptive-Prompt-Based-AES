"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { TaskRead } from "@/app/types/task";
import { ExamInDB } from "@/app/types/exam";
import Markdown from "react-markdown";

import remarkBreaks from "remark-breaks";
import {
  downloadExamPdf,
  downloadExamCsv,
  downloadMultipleExamsPdf,
  downloadMultipleExamsCsv,
  deleteExam,
  updateExam,
  reEvaluateExam,
  getExam,
} from "@/lib/ExamService";
import { DownloadCloud, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface PagePreviewProps {
  pages: ExamInDB[] | Partial<ExamInDB>[];
  taskPrompts: TaskRead[];
  onScoreUpdate: (pageId: number, category: string, score: number) => void;
  onOcrTextUpdate: (pageId: number, text: string) => void;
}

export default function PagePreview({
  pages,
  onScoreUpdate,
  onOcrTextUpdate,
}: PagePreviewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [paneWidth, setPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showReevaluateDialog, setShowReevaluateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [examImage, setExamImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  const [editedOcrText, setEditedOcrText] = useState("");
  const [editedScore, setEditedScore] = useState({});

  const containerRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[currentPageIndex];
  const token = sessionStorage.getItem("token") || "";

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExamPdf = async () => {
    if (currentPage.id && currentPage.project_id) {
      const blob = await downloadExamPdf(
        token,
        currentPage.project_id,
        currentPage.id
      );
      if (blob) downloadBlob(blob, `exam-${currentPage.id}.pdf`);
    }
    setShowDownloadDialog(false);
  };

  const handleDownloadExamCsv = async () => {
    if (currentPage.id && currentPage.project_id) {
      const blob = await downloadExamCsv(
        token,
        currentPage.project_id,
        currentPage.id
      );
      if (blob) downloadBlob(blob, `exam-${currentPage.id}.csv`);
    }
    setShowDownloadDialog(false);
  };

  const handleDownloadAllExamsPdf = async () => {
    if (currentPage.project_id) {
      const blob = await downloadMultipleExamsPdf(
        token,
        currentPage.project_id
      );
      if (blob) downloadBlob(blob, `exams-${currentPage.project_id}.pdf`);
    }
    setShowDownloadDialog(false);
  };

  const handleDownloadAllExamsCsv = async () => {
    if (currentPage.project_id) {
      const blob = await downloadMultipleExamsCsv(
        token,
        currentPage.project_id
      );
      if (blob) downloadBlob(blob, `exams-${currentPage.project_id}.csv`);
    }
    setShowDownloadDialog(false);
  };

  useEffect(() => {
    setEditedOcrText(currentPage.exam_extracted_text || "");
  }, [currentPage]);

  useEffect(() => {
    async function fetchExamImage() {
      setIsImageLoading(true);
      if (currentPage && currentPage.id && currentPage.project_id) {
        const imageUrl = await getExam(
          token,
          currentPage.project_id,
          currentPage.id
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("Exam Image JSON:", data);
            if (data && data.exam_image_url) {
              return data.exam_image_url;
            }
            return null;
          })
          .catch((error) => {
            console.error("Error fetching exam image:", error);
            return null;
          });
        setExamImage(imageUrl || "");
      } else {
        setExamImage("");
      }
      setIsImageLoading(false);
    }
    fetchExamImage();
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setPaneWidth(Math.min(Math.max(newWidth, 20), 80));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleSaveOcrText = async () => {
    onOcrTextUpdate(currentPage.id || 0, editedOcrText);
    setShowUpdateDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (currentPage.id && currentPage.project_id) {
      try {
        await updateExam(
          token,
          currentPage.project_id,
          currentPage.id,
          currentPage
        );
        toast({
          title: "Success",
          description: "Exam updated successfully.",
          variant: "default",
        });
        setIsEditingOcr(false);
      } catch (error) {
        console.error("Error updating exam:", error);
        toast({
          title: "Error",
          description: "Failed to update exam.",
          variant: "destructive",
        });
      }
    }
    setShowUpdateDialog(false);
  };

  const handleConfirmReevaluate = async () => {
    if (currentPage.id && currentPage.project_id) {
      try {
        await reEvaluateExam(token, currentPage.project_id, currentPage.id);
        toast({
          title: "Success",
          description: "Exam re-evaluated successfully.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error re-evaluating exam:", error);
        toast({
          title: "Error",
          description: "Failed to re-evaluate exam.",
          variant: "destructive",
        });
      }
    }
    setShowReevaluateDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (currentPage.project_id) {
      await deleteExam(token, currentPage.project_id, currentPage.id || 0).then(
        (res) => {
          if (res) {
            setCurrentPageIndex((prevIndex) =>
              prevIndex >= pages.length - 1
                ? Math.max(prevIndex - 1, 0)
                : prevIndex
            );
            toast({
              title: "Success",
              description: "Exam deleted successfully.",
              variant: "default",
            });
          }
        }
      );
    }
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (showDownloadDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDownloadDialog]);

  useEffect(() => {
    if (pages.length && !pages[currentPageIndex]) {
      setCurrentPageIndex(Math.max(pages.length - 1, 0));
    }
  }, [pages, currentPageIndex]);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-primary p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">
          Page {currentPageIndex + 1} of {pages.length}
        </h3>
        <div className="flex justify-center align-middle gap-2">
          <div className="flex items-center space-x-2">
            {currentPage.id && (
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(true)}
              >
                Update Score
              </Button>
            )}
            {currentPage.id && (
              <Button
                variant="outline"
                onClick={() => setShowReevaluateDialog(true)}
              >
                Re-evaluate
              </Button>
            )}

            <Button
              className="aspect-square"
              variant="outline"
              onClick={() => setShowDownloadDialog(true)}
            >
              <DownloadCloud className="h-5 w-5" />
            </Button>
            {currentPage.id && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-5 w-5" />
              </Button>
            )}
            <button
              onClick={handlePrevious}
              disabled={currentPageIndex === 0}
              className="p-2 text-card-foreground hover:bg-accent rounded-md disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPageIndex === pages.length - 1}
              className="p-2 text-card-foreground hover:bg-accent rounded-md disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex">
        <div
          className="border border-primary rounded-lg p-4 overflow-auto"
          style={{ width: `${paneWidth}%` }}
        >
          <h4 className="text-sm font-medium text-card-foreground mb-2">
            Scanned Page
          </h4>
          <div className="aspect-[3/4] bg-gray-100 rounded flex items-center justify-center">
            {isImageLoading ? (
              <p className="text-gray-500">Loading image...</p>
            ) : examImage ? (
              <img
                key={examImage}
                src={examImage}
                alt={`Page ${currentPageIndex + 1}`}
                className="max-w-full max-h-full text-black"
              />
            ) : (
              <p className="text-gray-500">No image available.</p>
            )}
          </div>
        </div>

        <div
          className="w-1 bg-secondary cursor-col-resize hover:bg-accent transition-colors"
          onMouseDown={handleMouseDown}
        />

        <ScrollArea
          className="border border-primary rounded-lg p-4"
          style={{ width: `${100 - paneWidth}%`, maxHeight: "100vh" }}
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-card-foreground">
                  OCR Text
                </h4>
                <button
                  onClick={() => setIsEditingOcr(!isEditingOcr)}
                  className="flex items-center gap-2 text-[#557adf] hover:text-primary transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                  {isEditingOcr ? "Cancel Edit" : "Edit OCR Text"}
                </button>
              </div>
              <div
                className={`border border-primary rounded-lg p-4 min-h-[200px] text-black bg-gray-50`}
              >
                {isEditingOcr ? (
                  <textarea
                    value={editedOcrText}
                    onChange={(e) => setEditedOcrText(e.target.value)}
                    className="w-full h-full p-2 bg-slate-200 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={25}
                  />
                ) : (
                  <Markdown remarkPlugins={[remarkBreaks]}>
                    {currentPage.exam_extracted_text}
                  </Markdown>
                )}
              </div>
              {isEditingOcr && (
                <Button
                  variant="outline"
                  onClick={handleSaveOcrText}
                  className="mt-2 w-full px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  Save Changes
                </Button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Task Completion Score (max 2.5)
              </label>
              <input
                type="number"
                min="0"
                max="2.5"
                step="0.1"
                value={currentPage.score_task_completion || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (val > 2.5) val = 2.5;
                  onScoreUpdate(
                    currentPage.id || 0,
                    "score_task_completion",
                    val
                  );
                  setEditedScore((prev) => ({
                    ...prev,
                    score_task_completion: val,
                  }));
                }}
                className="w-full p-2 border border-primary bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Structure Score (max 2.5)
              </label>
              <input
                type="number"
                min="0"
                max="2.5"
                step="0.1"
                value={currentPage.score_structural_variety_accuracy || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (val > 2.5) val = 2.5;
                  onScoreUpdate(
                    currentPage.id || 0,
                    "score_structural_variety_accuracy",
                    val
                  );
                  setEditedScore((prev) => ({
                    ...prev,
                    score_structural_variety_accuracy: val,
                  }));
                }}
                className="w-full p-2 border border-primary bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Language Score (max 2.5)
              </label>
              <input
                type="number"
                min="0"
                max="2.5"
                step="0.1"
                value={currentPage.score_style_language_expression || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (val > 2.5) val = 2.5;
                  onScoreUpdate(
                    currentPage.id || 0,
                    "score_style_language_expression",
                    val
                  );
                  setEditedScore((prev) => ({
                    ...prev,
                    score_style_language_expression: val,
                  }));
                }}
                className="w-full p-2 border border-primary bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Organization Score (max 2.5)
              </label>
              <input
                type="number"
                min="0"
                max="2.5"
                step="0.1"
                value={currentPage.score_organization || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (val > 2.5) val = 2.5;
                  onScoreUpdate(currentPage.id || 0, "score_organization", val);
                  setEditedScore((prev) => ({
                    ...prev,
                    score_organization: val,
                  }));
                }}
                className="w-full p-2 border border-primary bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                Scoring Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-card-foreground opacity-75">
                      Task Completion
                    </label>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div
                        className={`${
                          currentPage.score_task_completion ?? 0 / 2.5 > 0.8
                            ? "bg-green-500"
                            : currentPage.score_task_completion ?? 0 / 2.5 > 0.5
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        } h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${
                            ((currentPage.score_task_completion ?? 0) / 2.5) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-card-foreground opacity-75">
                      {currentPage.score_task_completion ?? 0}/2.5
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-card-foreground opacity-75">
                      Structure
                    </label>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div
                        className={`${
                          currentPage.score_structural_variety_accuracy ??
                          0 / 2.5 > 0.8
                            ? "bg-green-500"
                            : currentPage.score_structural_variety_accuracy ??
                              0 / 2.5 > 0.5
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        } h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${
                            ((currentPage.score_structural_variety_accuracy ??
                              0) /
                              2.5) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-card-foreground opacity-75">
                      {currentPage.score_structural_variety_accuracy ?? 0}/2.5
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-card-foreground opacity-75">
                      Language
                    </label>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div
                        className={`${
                          currentPage.score_style_language_expression ??
                          0 / 2.5 > 0.8
                            ? "bg-green-500"
                            : currentPage.score_style_language_expression ??
                              0 / 2.5 > 0.5
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        } h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${
                            ((currentPage.score_style_language_expression ??
                              0) /
                              2.5) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-card-foreground opacity-75">
                      {currentPage.score_style_language_expression ?? 0}/2.5
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-card-foreground opacity-75">
                      Organization
                    </label>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div
                        className={`${
                          currentPage.score_organization ?? 0 / 2.5 > 0.8
                            ? "bg-green-500"
                            : currentPage.score_organization ?? 0 / 2.5 > 0.5
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        } h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${
                            ((currentPage.score_organization ?? 0) / 2.5) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-card-foreground opacity-75">
                      {currentPage.score_organization ?? 0}/2.5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                Scoring Justification
              </h4>
              <div className="border border-primary rounded-lg p-4 text-black bg-gray-50 min-h-[100px]">
                <Markdown remarkPlugins={[remarkBreaks]}>
                  {currentPage.scoring_justification ||
                    "No justification provided yet."}
                </Markdown>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                Improved Version
              </h4>
              <div className="border border-primary rounded-lg p-4 text-black bg-gray-50 min-h-[100px]">
                <Markdown remarkPlugins={[remarkBreaks]}>
                  {currentPage.exam_improved_text ||
                    "No improved version generated yet."}
                </Markdown>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                AI Comment
              </h4>
              <div className="border border-primary rounded-lg p-4 text-black bg-gray-50 min-h-[100px]">
                <Markdown remarkPlugins={[remarkBreaks]}>
                  {currentPage.ai_comment || "No comment provided yet."}
                </Markdown>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Download Option</DialogTitle>
            <DialogDescription>
              Choose a download option below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleDownloadExamPdf}>
              Download Exam as PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadExamCsv}>
              Download Exam as CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadAllExamsPdf}>
              Download All Exams as PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadAllExamsCsv}>
              Download All Exams as CSV
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setShowDownloadDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update both OCR text and score?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmUpdate}>
              Yes, update
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showReevaluateDialog}
        onOpenChange={setShowReevaluateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Re-evaluation</DialogTitle>
            <DialogDescription>
              Are you sure you want to re-evaluate this exam?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmReevaluate}>
              Yes, re-evaluate
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowReevaluateDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Yes, delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
