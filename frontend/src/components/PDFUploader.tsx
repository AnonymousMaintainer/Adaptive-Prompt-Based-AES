"use client";

import type React from "react";

import { useState, useRef } from "react";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  // setFiles?: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function PDFUploader({ onUpload }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      setError("File size must be less than 50MB");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    if (validFiles.length) {
      setSelectedFiles(validFiles);
      handleUpload(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = files.filter(validateFile);
    if (validFiles.length) {
      setSelectedFiles(validFiles);
      handleUpload(validFiles);
    }
  };

  const handleUpload = (files: File[]) => {
    setError(null);
    setUploadProgress(0);
    let uploadedCount = 0;
    const totalFiles = files.length;
    const uploadNext = (index: number) => {
      if (index < totalFiles) {
        // if (setFiles) {
        //   setFiles((prevFiles) => [...prevFiles, files[index]]);
        // }
        onUpload(files[index]);
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
        setSelectedFiles((prev) => prev.slice(1)); // remove uploaded file from the display
        uploadNext(index + 1);
      }
    };
    uploadNext(0);
  };

  const removeFile = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-secondary bg-black bg-opacity-20"
            : "border-secondary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-secondary-foreground mb-4" />
        <p className="text-secondary-foreground mb-2">
          Drag and drop your PDF here, or{" "}
          <label className="text-[#557adf] cursor-pointer hover:underline">
            browse
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <p className="text-sm text-secondary-foreground opacity-75">
          Supported format: PDF (max 50MB)
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between">
              <span className="text-secondary-foreground">{file.name}</span>
              <button
                onClick={removeFile}
                className="text-secondary-foreground hover:text-secondary"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <div className="w-full bg-secondary-foreground rounded-full h-2">
            <div
              className="bg-[#4792FA] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-secondary-foreground opacity-75 text-right">
            {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
