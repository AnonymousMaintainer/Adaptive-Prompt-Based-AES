// "use client";

// import { useState } from "react";
// import TaskPromptForm from "../../components/TaskPromptForm";
// import type { TaskPrompt, TaskPromptData } from "../../app/types/task";
// import { TASK_STATUS } from "../../app/constants/task";

// export default function TasksPage() {
//   const [taskPrompts, setTaskPrompts] = useState<TaskPrompt[]>([]);
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleSaveDraft = (data: TaskPromptData) => {
//     // In a real app, this would save to a database
//     console.log("Saving draft:", data);
//     const newTask: TaskPrompt = {
//       id: Date.now().toString(),
//       courseName: data.courseName,
//       courseNumber: data.courseNumber,
//       year: data.year,
//       rubrics: data.rubrics,
//       exampleEvaluations: data.exampleEvaluations,
//       studentInstructions: data.studentInstructions,
//       status: "draft",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     setTaskPrompts((prev) => [...prev, newTask]);
//   };

//   const handleSubmit = (data: TaskPromptData) => {
//     // In a real app, this would save to a database
//     console.log("Submitting task:", data);
//     const newTask: TaskPrompt = {
//       id: Date.now().toString(),
//       courseName: data.courseName,
//       courseNumber: data.courseNumber,
//       year: data.year,
//       rubrics: data.rubrics,
//       exampleEvaluations: data.exampleEvaluations,
//       studentInstructions: data.studentInstructions,
//       status: "published",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     setTaskPrompts((prev) => [...prev, newTask]);
//     setShowSuccess(true);
//     setTimeout(() => setShowSuccess(false), 3000);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-[#040316]">Task Prompts</h1>
//         <div className="flex items-center space-x-4">
//           {showSuccess && (
//             <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
//               Task prompt created successfully!
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-[#A2E4F1] p-6">
//         <h2 className="text-xl font-semibold text-[#040316] mb-4">
//           Create New Task Prompt
//         </h2>
//         <p className="text-[#040316] opacity-75 mb-6">
//           Define how the AI should evaluate student essays by creating a task
//           prompt. Include clear rubrics, example evaluations, and student
//           instructions.
//         </p>

//         <TaskPromptForm onSaveDraft={handleSaveDraft} onSubmit={handleSubmit} />
//       </div>

//       {taskPrompts.length > 0 && (
//         <div className="bg-white rounded-lg shadow-sm border border-[#A2E4F1] p-6">
//           <h2 className="text-xl font-semibold text-[#040316] mb-4">
//             Recent Task Prompts
//           </h2>
//           <div className="space-y-4">
//             {taskPrompts.map((task) => (
//               <div
//                 key={task.id}
//                 className="border border-[#A2E4F1] rounded-lg p-4 hover:border-[#4792FA] transition-colors"
//               >
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-medium text-[#040316]">
//                       {task.courseName} ({task.courseNumber}) - {task.year}
//                     </h3>
//                     <p className="text-sm text-[#040316] opacity-75">
//                       Created: {new Date(task.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       TASK_STATUS[task.status].color
//                     }`}
//                   >
//                     {TASK_STATUS[task.status].label}
//                   </span>
//                 </div>
//                 <div className="mt-2 text-sm text-[#040316] opacity-75">
//                   {task.studentInstructions.substring(0, 150)}...
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
