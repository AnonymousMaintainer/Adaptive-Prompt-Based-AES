"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: number;
  link: string;
  filter?: string;
}

export default function StatsCard({
  title,
  value,
  link,
  filter,
}: StatsCardProps) {
  return (
    <motion.div
      className=" flex flex-col gap-4 flex-1"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Link
        href={`/${link}${filter ? `?examStatus=${filter}` : ""}`}
        className="p-6 rounded-lg bg-card shadow-md border hover:border-card-foreground transition-colors group"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {title}
            </h3>
            <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-card-foreground to-accent mt-2">
              {value}
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-card-foreground group-hover:text-card-foreground transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}
