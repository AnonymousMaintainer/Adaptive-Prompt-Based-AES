"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";

export default function CollapsibleExplanation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExample, setShowExample] = useState(false);

  return (
    <Card className="bg-card rounded-lg shadow-sm border mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg text-left hover:bg-accent transition-colors"
      >
        <h3 className="text-lg font-semibold text-card-foreground">
          How to Use This Page
        </h3>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-card-foreground" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-card-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-t overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-card-foreground mb-2">
                  Workflow Overview
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-card-foreground">
                  <li>Create a new project for your exam batch</li>
                  <li>Upload scanned PDFs of student submissions</li>
                  <li>Review OCR-extracted text for accuracy</li>
                  <li>Select appropriate task prompts for scoring</li>
                  <li>Monitor AI scoring progress in real-time</li>
                  <li>Review and adjust scores as needed</li>
                  <li>Export results when complete</li>
                </ol>
              </div>

              <button
                onClick={() => setShowExample(!showExample)}
                className="text-[#4792FA] hover:text-[#9EC6FF] transition-colors flex items-center gap-2"
              >
                {showExample ? "Hide Example" : "See Example Workflow"}
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    showExample ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showExample && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-secondary p-4 rounded-lg border overflow-hidden"
                  >
                    <h5 className="font-medium text-secondary-foreground mb-2">
                      Example: Grading Midterm Essays
                    </h5>
                    <ol className="list-decimal list-inside space-y-2 text-secondary-foreground">
                      <li>
                        Create project &quot;ENG101 Spring 2024 Midterm&quot;
                      </li>
                      <li>Upload scanned essays (PDF format)</li>
                      <li>System automatically splits into individual pages</li>
                      <li>Select &quot;Essay Analysis&quot; task prompt</li>
                      <li>AI processes and scores each essay</li>
                      <li>Review scores and make adjustments</li>
                      <li>Export final grades to your LMS</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
