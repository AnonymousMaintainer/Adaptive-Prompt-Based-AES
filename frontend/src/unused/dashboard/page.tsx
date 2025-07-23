// "use client"

// import StatsCard from "../components/StatsCard"
// import ScoreDistributionChart from "../components/ScoreDistributionChart"
// import { BellIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

// // Dummy data - in a real app, this would come from an API
// const teacherName = "Dr. Smith"
// const stats = {
//   totalStudents: 150,
//   pendingExams: 25,
//   inProgressExams: 15,
//   completedExams: 110,
// }

// const announcements = [
//   {
//     id: 1,
//     title: "System Maintenance",
//     content: "Scheduled maintenance on Saturday, 10:00 PM - 11:00 PM",
//     date: "2024-04-01",
//   },
//   {
//     id: 2,
//     title: "New Feature Release",
//     content: "Bulk upload functionality now available",
//     date: "2024-03-28",
//   },
// ]

// export default function DashboardPage() {
//   return (
//     <div className="space-y-8">
//       {/* Welcome Section */}
//       <div>
//         <h1 className="text-4xl font-bold text-[#040316]">Welcome back, {teacherName}!</h1>
//         <p className="text-lg text-[#040316] mt-2">Here's an overview of your current tasks and statistics.</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard title="Total Students" value={stats.totalStudents} filter="all" />
//         <StatsCard title="Exams Pending" value={stats.pendingExams} filter="pending" />
//         <StatsCard title="Exams In Progress" value={stats.inProgressExams} filter="in-progress" />
//         <StatsCard title="Exams Completed" value={stats.completedExams} filter="completed" />
//       </div>

//       {/* Score Distribution Chart */}
//       <ScoreDistributionChart />

//       {/* Announcements and Contact Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Announcements */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-[#A2E4F1]">
//           <div className="flex items-center gap-2 mb-4">
//             <BellIcon className="h-5 w-5 text-[#040316]" />
//             <h3 className="text-lg font-semibold text-[#040316]">Announcements</h3>
//           </div>
//           <div className="space-y-4">
//             {announcements.map((announcement) => (
//               <div key={announcement.id} className="border-b border-[#A2E4F1] pb-4 last:border-0">
//                 <h4 className="font-medium text-[#040316]">{announcement.title}</h4>
//                 <p className="text-sm text-[#040316] mt-1">{announcement.content}</p>
//                 <p className="text-xs text-[#040316] opacity-75 mt-2">{announcement.date}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Developer Contact */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-[#A2E4F1]">
//           <div className="flex items-center gap-2 mb-4">
//             <EnvelopeIcon className="h-5 w-5 text-[#040316]" />
//             <h3 className="text-lg font-semibold text-[#040316]">Developer Contact</h3>
//           </div>
//           <div className="space-y-2">
//             <p className="text-[#040316]">
//               <span className="font-medium">Email:</span> support@emailscoring.com
//             </p>
//             <p className="text-[#040316]">
//               <span className="font-medium">Phone:</span> +1 (555) 123-4567
//             </p>
//             <p className="text-[#040316]">
//               <span className="font-medium">Office Hours:</span> Mon-Fri, 9:00 AM - 5:00 PM
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
