"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";

interface SuccessAlertProps {
  title?: string;
  description: string;
}

export function SuccessAlert({
  title = "Success",
  description,
}: SuccessAlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert
        variant="default"
        className="border-green-500 bg-green-50 dark:bg-green-950 flex items-start"
      >
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-green-800 dark:text-green-200">
            {title}
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {description}
          </AlertDescription>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
