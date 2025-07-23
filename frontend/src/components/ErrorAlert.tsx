import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX, X } from "lucide-react";
import { useState } from "react";

interface ErrorAlertProps {
  title?: string;
  description: string;
}

export function ErrorAlert({ title = "Error", description }: ErrorAlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert
        variant="default"
        className="border-red-500 bg-red-50 dark:bg-red-950 flex items-start"
      >
        <CircleX className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-red-800 dark:text-red-200">
            {title}
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {description}
          </AlertDescription>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
