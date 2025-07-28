import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

interface TaskCardProps {
  exam: {
    id: number;
    status: string;
    studentName: string;
    submissionDate: string;
    taskType: string;
  };
  index: number;
}

export default function TaskCard({ exam, index }: TaskCardProps) {
  const isPending = exam.status.toLowerCase() === "pending";

  const cardContent = (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Task #{exam.id}</CardTitle>
            <Badge
              variant={
                exam.status.toLowerCase() === "pending"
                  ? "default"
                  : "secondary"
              }
            >
              {exam.status}
            </Badge>
          </div>
          <CardDescription>Submitted on {exam.submissionDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{exam.studentName}</span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>{exam.taskType}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Time elapsed: {index * 10} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  if (isPending) {
    return (
      <div className="block cursor-not-allowed transition-opacity border rounded-lg border-transparent hover:border-red-700">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/status/${exam.id}`}
      className="block hover:opacity-80 transition-opacity border rounded-lg border-transparent hover:border-green-700"
    >
      {cardContent}
    </Link>
  );
}
