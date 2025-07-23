"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginSession } from "@/context/LoginSessionContext";
import { Skeleton } from "./ui/skeleton";

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useLoginSession();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Render shadcn UI skeleton with sidebar, card, and text placeholders
    return (
      <div className="flex">
        <div className="w-1/4">
          <Skeleton className="h-full" />
        </div>
        <div className="w-3/4 p-4">
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-6 mb-2" />
          <Skeleton className="h-6" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
