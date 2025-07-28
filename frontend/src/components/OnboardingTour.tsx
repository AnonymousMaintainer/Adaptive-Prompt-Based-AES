"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useLoginSession } from "@/context/LoginSessionContext";
import { useFloating, offset, flip, shift } from "@floating-ui/react-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// define each step with its path, selector, title, and description
interface TourStep {
  path: string;
  selector: string;
  title: string;
  description: string;
}
const steps: TourStep[] = [
  // Dashboard
  {
    path: "/",
    selector: '[data-tour="sidebar-toggle"]',
    title: "Open Sidebar",
    description: "Toggle the application sidebar.",
  },
  {
    path: "/",
    selector: '[data-tour="dashboard-title"]',
    title: "Dashboard Overview",
    description: "View your exam stats and announcements on the dashboard.",
  },
  // Projects List
  {
    path: "/projects",
    selector: '[data-tour="projects-title"]',
    title: "Projects Page",
    description: "Here you can view and refresh your projects.",
  },
  {
    path: "/projects",
    selector: '[data-tour="projects-create"]',
    title: "Create Project",
    description: "Click to create a new project.",
  },
  // Project Detail
  {
    path: "/projects/0?demo=true",
    selector: '[data-tour="file-uploader"]',
    title: "Upload PDFs",
    description: "Upload exam PDFs to this project.",
  },
  {
    path: "/projects/0?demo=true",
    selector: '[data-tour="evaluate-button"]',
    title: "Evaluate Exams",
    description: "Start AI evaluation of uploaded exams.",
  },
  // Task page
  {
    path: "/task",
    selector: '[data-tour="task-list-tab"]',
    title: "Task List",
    description: "View your existing tasks here.",
  },
  {
    path: "/task",
    selector: '[data-tour="task-create-tab"]',
    title: "Create/Edit Task",
    description: "Switch to the create/edit task form.",
  },
  {
    path: "/task",
    selector: '[data-tour="task-form"]',
    title: "Task Form",
    description: "Fill in details to create or update a task.",
  },
  // Settings page
  {
    path: "/settings",
    selector: '[data-tour="settings-account-tab"]',
    title: "Account Settings",
    description: "Manage your email and phone number.",
  },
  {
    path: "/settings",
    selector: '[data-tour="settings-security-tab"]',
    title: "Security Settings",
    description: "Update your password and security settings.",
  },
  {
    path: "/settings",
    selector: '[data-tour="clear-cache"]',
    title: "Clear Cache",
    description: "Clear all local cache and sign out.",
  },
  // Register page
  {
    path: "/register",
    selector: '[data-tour="register-button"]',
    title: "Register User",
    description: "Add a new user account here.",
  },
  {
    path: "/register",
    selector: '[data-tour="users-table"]',
    title: "Users List",
    description: "Manage or delete existing users.",
  },
];

// whitelist of selectors allowed to be auto-clicked during tour
const clickWhitelist = new Set<string>([
  '[data-tour="projects-create"]',
  '[data-tour="task-list-tab"]',
  '[data-tour="task-create-tab"]',
  '[data-tour="file-uploader"]',
  // add selectors here to enable auto-click, e.g.:
  // '[data-tour="sidebar-toggle"]',
  // '[data-tour="projects-create"]',
]);

export default function OnboardingTour() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevElement = useRef<HTMLElement | null>(null);
  const { loading, isAuthenticated } = useLoginSession();
  const router = useRouter();
  const pathname = usePathname();
  const step = steps[current];
  // highlight overlay coords
  const [highlightCoords, setHighlightCoords] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const {
    x,
    y,
    strategy,
    update,
    refs: { setReference, setFloating },
  } = useFloating({
    placement: "bottom",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  useEffect(() => {
    // only show on first visit after login
    if (loading) return;
    if (isAuthenticated) {
      const done = localStorage.getItem("onboarding_done");
      if (!done) {
        setVisible(true);
      }
    }
  }, [loading, isAuthenticated]);

  // navigate to target route on step change
  useEffect(() => {
    if (!visible) return;
    const slug = pathname.split("/")[2] || "";
    const targetPath = step.path.replace("[slug]", slug);
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [current, visible, pathname, router, step.path]);

  // highlight and position tooltip when route matches step
  useEffect(() => {
    if (!visible) return;
    const handleHighlight = () => {
      const slug = pathname.split("/")[2] || "";
      const targetPath = step.path.replace("[slug]", slug);
      if (pathname !== targetPath) {
        if (prevElement.current) {
          prevElement.current.style.outline = "";
          prevElement.current = null;
        }
        setHighlightCoords(null);
        return;
      }
      const el = document.querySelector(step.selector) as HTMLElement;
      if (!el) {
        if (prevElement.current) {
          prevElement.current.style.outline = "";
          prevElement.current = null;
        }
        setHighlightCoords(null);
        return;
      }
      if (prevElement.current && prevElement.current !== el) {
        prevElement.current.style.outline = "";
      }
      // outline current element for component highlighting
      el.style.outline = "2px solid #3b82f6";
      prevElement.current = el;
      // update overlay coords
      const rect = el.getBoundingClientRect();
      setHighlightCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      // set tooltip reference
      setReference(el);
      update();
    };
    handleHighlight();
    window.addEventListener("scroll", handleHighlight);
    window.addEventListener("resize", handleHighlight);
    return () => {
      window.removeEventListener("scroll", handleHighlight);
      window.removeEventListener("resize", handleHighlight);
      if (prevElement.current) {
        prevElement.current.style.outline = "";
        prevElement.current = null;
      }
      setHighlightCoords(null);
    };
  }, [
    current,
    visible,
    pathname,
    step.path,
    step.selector,
    setReference,
    update,
  ]);

  // simulate click on the step's element to open tabs/buttons automatically
  useEffect(() => {
    if (!visible) return;
    const clickElement = () => {
      const el = document.querySelector(step.selector) as HTMLElement;
      if (el && clickWhitelist.has(step.selector)) {
        el.click();
      }
    };
    const timeout = setTimeout(clickElement, 300);
    return () => clearTimeout(timeout);
  }, [current, visible, pathname, step.selector]);

  // cleanup highlight on finish
  const finish = () => {
    setVisible(false);
    // clear highlight
    if (prevElement.current) {
      prevElement.current.style.outline = "";
      prevElement.current = null;
    }
    localStorage.setItem("onboarding_done", "true");
  };

  // allow manual triggering of the onboarding tour for testing
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem("onboarding_done");
      setCurrent(0);
      setVisible(true);
    };
    window.addEventListener("startOnboarding", handler);
    return () => window.removeEventListener("startOnboarding", handler);
  }, []);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/30" />
      {highlightCoords && (
        <div
          className="absolute pointer-events-none border-2 border-blue-500 rounded"
          style={{
            top: highlightCoords.top,
            left: highlightCoords.left,
            width: highlightCoords.width,
            height: highlightCoords.height,
          }}
        />
      )}
      <div
        ref={setFloating}
        style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
        className={cn("pointer-events-auto w-64 absolute", "-translate-x-1/2")}
      >
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">{step.title}</h4>
          </CardHeader>
          <CardContent>
            <p>{step.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
              disabled={current === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (current < steps.length - 1) {
                  const nextIndex = current + 1;
                  setCurrent(nextIndex);
                  setTimeout(() => {
                    const nextStep = steps[nextIndex];
                    const el = document.querySelector(
                      nextStep.selector
                    ) as HTMLElement;
                    if (el && clickWhitelist.has(nextStep.selector)) {
                      el.click();
                    }
                  }, 300);
                } else {
                  finish();
                }
              }}
            >
              {current === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>,
    document.body
  );
}

export { steps };
