// "use client";

// import { useState } from "react";
// import CollapsibleExplanation from "../../components/CollapsibleExplanation";
// import CreateProjectModal from "../../components/CreateProjectModal";
// import PDFUploader from "../../components/PDFUploader";
// import PagePreview from "../../components/PagePreview";
// import ProjectOverview from "../../components/ProjectOverview";
// import { PlayIcon } from "@heroicons/react/24/outline";

// type ProjectStatus = "in_progress" | "completed" | "pending";

// // Dummy data for task prompts
// const dummyTaskPrompts = [
//   {
//     id: "1",
//     name: "Essay Analysis",
//     course: "ENG101",
//     year: "2024",
//     section: "A",
//     description:
//       "Analyze the structure, argumentation, and writing quality of student essays.",
//   },
//   {
//     id: "2",
//     name: "Research Paper",
//     course: "ENG201",
//     year: "2024",
//     section: "B",
//     description:
//       "Evaluate research methodology, citations, and academic writing standards.",
//   },
//   {
//     id: "3",
//     name: "Short Answer Questions",
//     course: "HIST101",
//     year: "2024",
//     section: "C",
//     description:
//       "Assess accuracy, completeness, and clarity of historical analysis.",
//   },
// ];

// // Dummy data for projects
// const dummyProjects: Project[] = [
//   {
//     id: "1",
//     name: "Spring 2024 Midterm",
//     courseId: "ENG101",
//     section: "A",
//     totalPages: 12,
//     scoredPages: 8,
//     lastUpdated: "2024-04-02 14:30",
//     status: "in_progress",
//     year: "2024",
//     semester: "Spring",
//   },
//   {
//     id: "2",
//     name: "Research Paper Drafts",
//     courseId: "ENG201",
//     section: "B",
//     totalPages: 15,
//     scoredPages: 5,
//     lastUpdated: "2024-04-01 16:45",
//     status: "pending",
//     year: "2024",
//     semester: "Spring",
//   },
//   {
//     id: "3",
//     name: "History Final Exam",
//     courseId: "HIST101",
//     section: "C",
//     totalPages: 20,
//     scoredPages: 20,
//     lastUpdated: "2024-03-28 10:15",
//     status: "completed",
//     year: "2024",
//     semester: "Spring",
//   },
// ];

// export default function ExamsPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState<string | null>(null);
//   const [selectedTask, setSelectedTask] = useState("");
//   const [isEvaluating, setIsEvaluating] = useState(false);
//   const [pages, setPages] = useState<
//     Array<{
//       id: string;
//       imageUrl: string;
//       ocrText: string;
//       score?: number;
//       hasOcrIssues?: boolean;
//       scoringSummary?: {
//         content: number;
//         structure: number;
//         language: number;
//         originality: number;
//       };
//       justification?: string;
//       improvedVersion?: string;
//     }>
//   >([]);

//   const handleCreateProject = (projectData: {
//     name: string;
//     courseId: string;
//     section: string;
//   }) => {
//     // In a real app, this would create a new project in the database
//     console.log("Creating project:", projectData);
//     // Simulate adding a new project
//     const newProject: Project = {
//       id: String(dummyProjects.length + 1),
//       name: projectData.name,
//       courseId: projectData.courseId,
//       section: projectData.section,
//       totalPages: 0,
//       scoredPages: 0,
//       lastUpdated: new Date().toISOString(),
//       status: "pending" as ProjectStatus,
//       year: "2024",
//       semester: "Spring",
//     };
//     dummyProjects.push(newProject);
//   };

//   const handlePDFUpload = (file: File) => {
//     // In a real app, this would upload the file and process it
//     console.log("Uploading PDF:", file.name);
//     // Simulate page extraction with some OCR issues
//     setPages([
//       {
//         id: "1",
//         imageUrl: "/placeholder-page.jpg",
//         ocrText: "This is a sample OCR text extracted from the scanned page...",
//         hasOcrIssues: true,
//       },
//       {
//         id: "2",
//         imageUrl: "/placeholder-page.jpg",
//         ocrText: "Another page with clear text and no OCR issues.",
//         hasOcrIssues: false,
//       },
//     ]);
//   };

//   const handleScoreUpdate = (pageId: string, score: number) => {
//     setPages((prevPages) =>
//       prevPages.map((page) => (page.id === pageId ? { ...page, score } : page))
//     );
//     // Update project progress
//     const project = dummyProjects.find((p) => p.id === selectedProject);
//     if (project) {
//       project.scoredPages = pages.filter((p) => p.score).length;
//       project.status =
//         project.scoredPages === project.totalPages
//           ? "completed"
//           : "in_progress";
//     }
//   };

//   const handleOcrTextUpdate = (pageId: string, text: string) => {
//     setPages((prevPages) =>
//       prevPages.map((page) =>
//         page.id === pageId ? { ...page, ocrText: text } : page
//       )
//     );
//   };

//   const evaluateAllPages = async () => {
//     if (!selectedTask) {
//       alert("Please select a task prompt first");
//       return;
//     }

//     setIsEvaluating(true);
//     // Simulate AI evaluation for each page
//     for (let i = 0; i < pages.length; i++) {
//       if (!pages[i].score) {
//         // Only evaluate unscored pages
//         // Simulate AI processing time
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         // Generate a random score between 1 and 10
//         const score = Math.floor(Math.random() * 10) + 1;
//         handleScoreUpdate(pages[i].id, score);
//       }
//     }
//     setIsEvaluating(false);
//   };

//   return (
//     <div className="space-y-6">
//       <CollapsibleExplanation />

//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-[#040316]">Exams</h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="bg-[#9EC6FF] text-[#040316] px-4 py-2 rounded-lg hover:bg-[#4792FA] transition-colors"
//         >
//           Create Project
//         </button>
//       </div>

//       {selectedProject ? (
//         <div className="space-y-6">
//           <div className="bg-white rounded-lg shadow-sm border border-[#A2E4F1] p-6">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-[#040316]">
//                   {dummyProjects.find((p) => p.id === selectedProject)?.name}
//                 </h2>
//                 <p className="text-sm text-[#040316] opacity-75">
//                   {
//                     dummyProjects.find((p) => p.id === selectedProject)
//                       ?.courseId
//                   }{" "}
//                   - Section{" "}
//                   {dummyProjects.find((p) => p.id === selectedProject)?.section}
//                 </p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex-1 min-w-[300px]">
//                   <label className="block text-sm font-medium text-[#040316] mb-2">
//                     Select Task Prompt
//                   </label>
//                   <select
//                     value={selectedTask}
//                     onChange={(e) => setSelectedTask(e.target.value)}
//                     className="w-full p-2 border border-[#A2E4F1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9EC6FF]"
//                   >
//                     <option value="">Select a task prompt</option>
//                     {dummyTaskPrompts.map((task) => (
//                       <option key={task.id} value={task.id}>
//                         {task.name} - {task.course} {task.year} {task.section}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <button
//                   onClick={evaluateAllPages}
//                   disabled={isEvaluating || !selectedTask}
//                   className="flex items-center gap-2 bg-[#9EC6FF] text-[#040316] px-4 py-2 rounded-lg hover:bg-[#4792FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <PlayIcon className="h-5 w-5" />
//                   {isEvaluating ? "Evaluating..." : "Evaluate All Pages"}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <PDFUploader onUpload={handlePDFUpload} />
//           {pages.length > 0 && (
//             <PagePreview
//               pages={pages}
//               taskPrompts={dummyTaskPrompts}
//               onScoreUpdate={handleScoreUpdate}
//               onOcrTextUpdate={handleOcrTextUpdate}
//             />
//           )}
//         </div>
//       ) : (
//         <ProjectOverview
//           projects={dummyProjects}
//           onSelectProject={setSelectedProject}
//         />
//       )}

//       <CreateProjectModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onCreateProject={handleCreateProject}
//       />
//     </div>
//   );
// }
