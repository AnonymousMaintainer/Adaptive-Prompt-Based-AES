"use client";

import type React from "react";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  type?: "text" | "textarea" | "select";
  required?: boolean;
  helperText?: string;
  tooltip?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  helperText,
  tooltip,
  options,
  rows = 4,
}: FormFieldProps) {
  const inputClasses =
    "w-full p-2 border border-[#A2E4F1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9EC6FF]";

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className={inputClasses}
            required={required}
          />
        );
      case "select":
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            required={required}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            required={required}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#040316] mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {renderInput()}
        {tooltip && (
          <div className="absolute right-2 top-2 group">
            <InformationCircleIcon className="h-5 w-5 text-[#040316] opacity-50" />
            <div className="hidden group-hover:block absolute right-0 mt-2 w-64 p-2 bg-white border border-[#A2E4F1] rounded-md shadow-lg text-sm">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-sm text-[#040316] opacity-75">{helperText}</p>
      )}
    </div>
  );
}
